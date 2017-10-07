<template>
	<div class="app" :class="isDragging && classes.dragging">
		<ul class="images">
			<li class="images__item"
				v-for="(image, index) in images"
				:key="image.id"
				@mouseenter="mouseenterHandler(image, $event)"
				@mouseleave="mouseleaveHandler(image, $event)"
				:class="getClasses(image)"
				:style="`background-image: url(http://placehold.it/${image.image.width}x${image.image.height}/eee/eee)`">
					<img class="images__img" :src="`http://placehold.it/${image.image.width}x${image.image.height}/eee/eee`" :width="image.image.width" :height="image.image.height" alt="?">
			</li>
		</ul>

		<ul class="names">
			<li class="names__item" v-for="name in names" :key="name.id">
				<button class="names__btn names__btn--placeholder"
					:disabled="name.isSuccess"
					@mousedown.capture="dragStart(name, $event.target, $event.type)"
					@touchstart.capture.passive="dragStart(name, $event.target, $event.type)">
					{{ name.name }}
				</button>
				<button class="names__btn names__btn--ghost" :style="getStyle(name)">{{ name.name }}</button>
			</li>
		</ul>
	</div>
</template>

<script>
	import { once } from 'sm-events'
	import { log, shuffleArray } from './utils'
	import { pointer } from './mixins'
	import instruments from './data/instruments.yml'

	export default {
		name: 'app',
		mixins: [ pointer() ],
		data() {
			const data = {
				isDragging: false,
				hovered: null,
				classes: {
					error: 'is-error',
					success: 'is-success',
					over: 'is-over',
					dragging: 'is-dragging'
				}
			}

			// Set names
			const names = shuffleArray(instruments)
			names.forEach((name) => {
				name.position = {}
				name.isSuccess = false
			})
			data.names = names

			// Set images
			const images = shuffleArray(instruments)
			images.forEach((image) => {
				image.isSuccess = false
			})
			data.images = images

			return data
		},
		created() {
			log('app created')
		},
		methods: {


			/**
			 * Get classes for the given image
			 * @param  {Object} image The target image
			 * @return {Array}        An array of classes
			 */
			getClasses(image) {
				const classes = [];
				if (image.isOver && this.isDragging) {
					classes.push(this.classes.over)
				} else if (image.isSuccess) {
					classes.push(this.classes.success)
				}
				return classes
			},


			/**
			 * Set style for the given name
			 *
			 * @param  {Object} name The name to set the styles of
			 * @return {Object}      The styles to apply
			 */
			getStyle(name) {
				const styles = {
					transform: `translate3d(${name.position.x}px, ${name.position.y}px, 0)`,
					marginTop: `${name.position.marginTop}px`,
					marginLeft: `${name.position.marginLeft}px`
				}

				// Set it over all the other
				// if it is animating
				if (name.isAnimating) {
					styles.zIndex = 99
				}

				return styles
			},


			/**
			 * Setup and start the drag animation
			 *
			 * @param  {Object}      name The name being dragged
			 * @param  {HTMLElement} $el  The DOM element
			 */
			dragStart(name, $el, eventType) {
				log('dragStart', name.name, eventType)

				// Bind drop on release
				const event = eventType === 'mousedown' ? 'mouseup' : 'touchend'
				once(document, event, (e) => this.drop(name))

				// Get sizes of current name
				const sizes = $el.getBoundingClientRect();

				const x = this.pointer.x - sizes.left
				const y = this.pointer.y - sizes.top

				// Save all sizes needed for
				// the animations in an object
				name.position = {
					x: x,
					y: y,
					xOrig: x,
					yOrig: y,
					top: sizes.top,
					left: sizes.left,
					width: sizes.width,
					height: sizes.height,
					marginTop: y * -1,
					marginLeft: x * -1,
				}

				name.isDragging = true
				name.isAnimating = true
				this.isDragging = true
				this.tick(name);
			},



			/**
			 * End the dragging
			 *
			 * @param  {Object} name The current name being dragged
			 */
			dragEnd(name) {
				log('dragEnd', name.name)
				this.isDragging = false
				name.isDragging = false
			},



			drop(name) {
				log('drop', name.name)

				if (this.hovered !== null && name.id === this.hovered.id) {
					this.success(this.hovered, name)
				} else {
					this.error(this.hovered, name)
				}

				this.dragEnd(name)
			},



			success(image, name) {
				log('success', name.name)
				image.isSuccess = true
				name.isSuccess = true

				// Get target position
				const $el = document.elementFromPoint(this.pointer.x, this.pointer.y)
				const position = $el.getBoundingClientRect();
				image.x = position.left + position.width * 0.5
				image.y = position.top + position.height * 0.5
			},



			error(image, name) {
				log('error', name.name)
			},



			/**
			 * Set position of current name
			 *
			 * @param  {Object} name The name being dragged
			 */
			tick(name) {
				const position = name.position
				let x = position.xOrig
				let y = position.yOrig

				// Get target position from pointer
				// if currently dragging
				if (name.isDragging) {
					x = this.pointer.x - position.left
					y = this.pointer.y - position.top
				}

				// Get position from target if success
				// and name has been released
				if (!name.isDragging && name.isSuccess) {
					x = Math.round(position.left + (position.width * 0.5) + position.marginLeft - this.hovered.x) * -1
					y = Math.round(position.top + (position.height * 0.5) + position.marginTop - this.hovered.y) * -1
				}

				// Update current position
				position.x += (x - position.x) * 0.4
				position.y += (y - position.y) * 0.4

				// If current position is close to
				// target position, set current position to
				// target position (avoiding infinite round)
				if (Math.abs(x - position.x) < 0.1) {
					position.x = x
				}

				if (Math.abs(y - position.y) < 0.1) {
					position.y = y
				}

				// If x and y position are same as origin,
				// animation is finished, we do not need to tick again
				if (!name.isDragging && position.x === x && position.y === y) {
					name.isAnimating = false
					return false
				}

				// Tick agains
				requestAnimationFrame(this.tick.bind(this, name))
			},


			/**
			 * Update pointer position on touch move
			 *
			 * @param  {Object} event The event's object
			 */
			touchmoveHandler(event) {
				const touch = event.touches[0]
				// Enable rollover on images
				const $el = document.elementFromPoint(touch.clientX, touch.clientY)
				if ($el !== null) {
					const index = $el.getAttribute('data-index')
					this.images.forEach(image => image.isOver = false)
					if (index !== null) {
						this.hovered = this.images[index]
						this.images[index].isOver = true
					} else {
						this.hovered = null
					}
				}
			},


			/**
			 * Handler for the `mouseenter` event on an image
			 *
			 * @param  {Object} image The image being overed
			 * @param  {Object} event The event's object
			 */
			mouseenterHandler(image, event) {
				this.hovered = image
				image.isOver = true
			},


			/**
			 * Handler for the `mouseleave` event on an image
			 *
			 * @param  {Object} image The image being overed
			 * @param  {Object} event The event's object
			 */
			mouseleaveHandler(image, event) {
				this.hovered = null
				image.isOver = false
			}
		}
	}
</script>

<style lang="scss">
	@import "./assets/scss/fontfaces";

	*,
	*::after,
	*::before {
		box-sizing: border-box;
	}

	html,
	body {
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		overflow: hidden;
		-webkit-font-smoothing: antialiased;
		user-select: none;
	}

	body {
		position: absolute;
		top: 0;
		left: 0;
		font-family: "Brandon", sans-serif;
	}

	.is-dragging {
		cursor: grabbing;
	}


	.app {
		display: flex;
		align-items: stretch;
		width: 100%;
		height: 100%;
	}


	/*------------------------------------*\
			Images list
	\*------------------------------------*/

	.images {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 1em;
		list-style: none;
	}

	.images__item {
		position: relative;
		display: block;
		flex: 1 0 33.33%;
		width: 33.33%;
		height: 33.33%;
		padding: 1em;
		background: #fff;
		transition: background-color 0.2s ease-out;
		background-position: 50% 50%;
		background-repeat: no-repeat;
		background-size: contain;

		&.is-over {
			background-color: #eee;
		}

		&.is-success {
			background-color: #0f0 !important;
		}

		&.is-error {
			background-color: #f00;
		}
	}

	.images__img {
		display: none;
		width: 100%;
		height: auto;
	}


	/*------------------------------------*\
			Names list
	\*------------------------------------*/

	.names {
		margin: 0;
		padding: 1em;
		list-style: none;
	}

	.names__item {
		position: relative;
		float: right;
		clear: right;
		margin: 0.25em 0.5em 0.75em;
	}

	.names__btn {
		display: inline-block;
		padding: 0.5em 1em;
		font: inherit;
		text-transform: uppercase;
		white-space: nowrap;
		background: #eee;
		border: 0;
		border-radius: 5px;
		user-select: none;

		-webkit-appearance: none;
		cursor: grab;

		transition: box-shadow 0.05s ease-out;

		&:focus {
			outline: none;
		}

		&[disabled] {
			pointer-events: none;
		}
	}

	.names__btn--placeholder {
		color: #f9f9f9;
		background: #f9f9f9;
		box-shadow: inset 2px 2px 4px #e9e9e9;

		&:focus + .names__btn--ghost {
			box-shadow: inset 0 0 0 2px #ddd, 2px 2px 5px rgba(#000, 0);
		}

		&:active + .names__btn--ghost {
			color: currentColor;
			cursor: grabbing;
			box-shadow: inset 0 0 0 2px #ddd, 2px 2px 5px rgba(#000, 0.05);
		}
	}

	.names__btn--ghost {
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		box-shadow: inset 0 0 0 2px #eee, 2px 2px 5px rgba(#000, 0.00);
		pointer-events: none;
	}

</style>
