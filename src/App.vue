<template>
	<div class="app" :class="isDragging && classes.dragging">
		<div class="row">
			<div class="col">
				<ul class="images">
					<li class="images__item"
						v-for="(image, index) in images"
						@mouseenter="mouseenterHandler(image, $event)"
						@mouseleave="mouseleaveHandler(image, $event)"
						:class="getClasses(image)">
							<span :data-index="index" class="images__name">{{ image.name }}</span>
							<img class="images__img" :src="image.image.src" :width="image.image.width" :height="image.image.height" alt="?">
					</li>
				</ul>
			</div>
			<div class="col">
				<ul class="names">
					<li class="names__item" v-for="name in names" :key="name.id">
						<button class="names__btn names__btn--placeholder"
							:disabled="name.isSuccess"
							@mousedown="mousedownHandler(name, $event)"
							@touchstart.prevent="touchstartHandler(name, $event)">
							{{ name.name }}
						</button>
						<button class="names__btn names__btn--ghost" :style="getStyle(name)">{{ name.name }}</button>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	import { on, off, once } from 'sm-events'
	import instruments from './data/instruments.yml'

	const log = window.console.log.bind(window)
	export default {
		name: 'app',
		data() {
			const data = {
				isDragging: false,
				draggedId: null,
				over: null,
				classes: {
					error: 'is-error',
					success: 'is-success',
					over: 'is-over',
					dragging: 'is-dragging'
				},
				pointer: {
					x: 0,
					y: 0
				}
			}

			// Set names
			const names = this.shuffle(instruments)
			names.forEach((name) => {
				name.position = {}
				name.isSuccess = false
			})
			data.names = names

			// Set images
			const images = this.shuffle(instruments)
			images.forEach((image) => {
				image.isSuccess = false
			})
			data.images = images

			return data
		},
		watch: {
			draggedId(newValue) {
				log('draggedId', newValue)
			},
			over(newValue) {
				log('draggedId', newValue)
			}
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
			 * Return a shuffled copy of an array
			 *
			 * @param  {Array} array The array to shuffle
			 * @return {Array}     The shuffled array
			 */
			shuffle(array) {
				return array.slice().sort(() => 0.5 - Math.random())
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
			 * Handler for the `touchstart` event on a name
			 *
			 * @param  {Object} name  The target name
			 * @param  {Object} event The event's object
			 */
			touchstartHandler(name, event) {
				log('touchstartHandler', name.name)

				const touch = event.touches[0]
				this.pointer.x = touch.clientX
				this.pointer.y = touch.clientY

				on(document, 'touchmove', this.touchmoveHandler.bind(this))
				once(document, 'touchend', (e) => {
					off(document, 'touchmove', this.touchmoveHandler)
					this.drop(name)
					// this.dragEnd(name)
					// this.images.forEach(image => image.isOver = false)
				})

				this.dragStart(name, event.target)
			},



			/**
			 * Handler for the `mousedown` event on a name
			 *
			 * @param  {Object} name  The target name
			 * @param  {Object} event The event's object
			 */
			mousedownHandler(name, event) {
				log('mousedownHandler', name.name)

				this.pointer.x = event.clientX
				this.pointer.y = event.clientY

				on(document, 'mousemove', this.mousemoveHandler.bind(this))
				once(document, 'mouseup', (e) => {
					off(document, 'mousemove', this.mousemoveHandler)
					this.drop(name)
					// this.dragEnd(name)
				})

				this.dragStart(name, event.target)
			},



			/**
			 * Setup and start the drag animation
			 *
			 * @param  {Object}      name The name being dragged
			 * @param  {HTMLElement} $el  The DOM element
			 */
			dragStart(name, $el) {
				log('dragStart', name.name)

				this.draggedId = name.id

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

				this.isDragging = true
				name.isDragging = true
				name.isAnimating = true

				this.tick(name);
			},



			/**
			 * End the dragging
			 *
			 * @param  {Object} name The current name being dragged
			 */
			dragEnd(name) {
				log('dragEnd', name.name)

				this.draggedId = null
				this.isDragging = false
				name.isDragging = false
			},



			drop(name) {
				log('drop', name.name)

				if (this.over !== null && name.id === this.over.id) {
					this.success(this.over, name)
				} else {
					this.error(this.over, name)
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

				if (name.isDragging) {
					// Get target position
					const x = this.pointer.x - position.left
					const y = this.pointer.y - position.top
					// Update current position
					position.x += (x - position.x) * 0.4
					position.y += (y - position.y) * 0.4
				} else if (name.isAnimating) {
					const x = this.over && this.over.id === name.id ? Math.round(position.left + (position.width * 0.5) + position.marginLeft - this.over.x) * -1 : position.xOrig
					const y = this.over && this.over.id === name.id ? Math.round(position.top + (position.height * 0.5) + position.marginTop - this.over.y) * -1 : position.yOrig

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
					if (position.x === x && position.y === y) {
						name.isAnimating = false
						return false
					}
				}

				// Tick agains
				requestAnimationFrame(this.tick.bind(this, name))
			},



			/**
			 * Update pointer position on mouse move
			 *
			 * @param  {Object} event The event's object
			 */
			mousemoveHandler(event) {
				this.pointer.x = event.clientX
				this.pointer.y = event.clientY
			},



			/**
			 * Update pointer position on touch move
			 *
			 * @param  {Object} event The event's object
			 */
			touchmoveHandler(event) {
				const touch = event.touches[0]
				this.pointer.x = touch.clientX
				this.pointer.y = touch.clientY

				// Enable rollover on images
				const $el = document.elementFromPoint(touch.clientX, touch.clientY)
				if ($el !== null) {
					const index = $el.getAttribute('data-index')
					this.images.forEach(image => image.isOver = false)
					if (index !== null) {
						this.over = this.images[index]
						this.images[index].isOver = true
					} else {
						this.over = null
					}
				}
			},


			mouseenterHandler(image, event) {
				this.over = image
				image.isOver = true
			},

			mouseleaveHandler(image, event) {
				this.over = null
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
		-webkit-font-smoothing: antialiased;
		user-select: none;
	}

	body {
		padding: 1em;
		font-family: "Brandon", sans-serif;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
	}


	.is-dragging {
		cursor: grabbing;
	}


	/*------------------------------------*\
			Images list
	\*------------------------------------*/

	.images {
		display: flex;
		max-width: 600px;
		flex-wrap: wrap;
		margin: 0;
		padding-left: 0;
		list-style: none;
		border: 1px solid #eee;
	}

	.images__item {
		position: relative;
		display: block;
		flex: 1 0 33.33%;
		padding: 1em;
		border: 1px solid #eee;
		background: #fff;
		transition: background 0.2s ease-out;

		&.is-over {
			background: #eee;
		}

		&.is-success {
			background: #0f0 !important;
		}

		&.is-error {
			background: #f00;
		}
	}

	.images__img {
		display: block;
		width: 100%;
		height: auto;
	}


	.images__name {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		text-transform: capitalize;
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
