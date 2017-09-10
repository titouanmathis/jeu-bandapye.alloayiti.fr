<template>
	<div class="app">
		<div class="row">
			<div class="col">
				<ul class="images">
					<li class="images__item" v-for="image in images" @drop="dropHandler(image)" @dragover.prevent @dragenter="dragenterHandler(image)" @dragleave="dragleaveHandler(image)" :class="image.classes.join(' ')">
						<span class="images__name">{{ image.name }}</span>
						<img class="images__img" :src="image.image.src" :width="image.image.width" :height="image.image.height" alt="?">
					</li>
				</ul>
			</div>
			<div class="col">
				<ul class="names">
					<li class="names__item" v-for="name in names" :key="name.id">
						<span draggable="true" @dragstart="dragstartHandler(name)" @dragend="dragendHandler" class="names__btn">{{ name.name }}</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	import instruments from './data/instruments.yml'

	export default {
		name: 'app',
		data() {
			return {
				isDragging: false,
				names: instruments.slice().sort(() => 0.5 - Math.random()),
				images: instruments.slice().sort(() => 0.5 - Math.random()),
				currentName: null,
				classes: {
					error: 'is-error',
					success: 'is-success',
					over: 'is-over'
				}
			}
		},
		methods: {

			/**
			 * Handler for the drop on a target
			 *
			 * @param  {Object} image The target object
			 */
			dropHandler(image) {
				this.removeClass(image, this.classes.over)
				if (this.currentName.id === image.id) {
					this.addClass(image, this.classes.success)
					const index = this.names.indexOf(this.currentName)
					this.names.splice(index, 1)
				} else {
					this.addClass(image, this.classes.error)
					setTimeout(() => {
						this.removeClass(image, this.classes.error)
					}, 500);
				}
			},

			/**
			 * Handler for the `dragstart` event
			 *
			 * @param  {Object} name The name's object
			 */
			dragstartHandler(name) {
				this.currentName = name
				this.isDragging = true
			},

			/**
			 * Handler for the `dragend` event
			 */
			dragendHandler() {
				this.isDragging = false
			},

			/**
			 * Handler for the `dragenter` event
			 *
			 * @param  {Object} image The object of the image being entered
			 */
			dragenterHandler(image) {
				this.addClass(image, this.classes.over)
			},

			/**
			 * Handler for the `dragleave` event
			 *
			 * @param  {Object} image The object of the image being leaved
			 */
			dragleaveHandler(image) {
				this.removeClass(image, this.classes.over)
			},

			/**
			 * Helper to add a class name to a given object
			 *
			 * @param {Object} object    The object to add the class to
			 * @param {String} className The class name to add
			 */
			addClass(object, className) {
				object.classes.push(className)
			},

			/**
			 * Helper to remove a class name from a given object
			 *
			 * @param  {Object} object    The object to remove the class from
			 * @param  {String} className The class name to remove
			 */
			removeClass(object, className) {
				const index = object.classes.indexOf(className)
				object.classes.splice(index, 1)
			}
		}
	}
</script>

<style lang="scss">
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
	}

	body {
		padding: 1em;
		font-family: sans-serif;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
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

		&.is-over {
			background: #eee;
		}

		&.is-success {
			background: #0f0;
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
		margin: 0.25em;
	}

	.names__btn {
		display: block;
		padding: 0.5em 1em;
		font: inherit;
		text-transform: capitalize;
		background: #eee;
		border: 0;
		-webkit-appearance: none;
		cursor: grab;
		border-radius: 5px;

		&:active {
			cursor: grabbing;
		}

		&:focus {
			outline: none;
			box-shadow: inset 0 0 0 2px #aaa;
		}
	}

</style>
