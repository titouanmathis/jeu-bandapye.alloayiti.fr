<template>
	<div id="app">
		<div class="row">
			<div class="col">
				<ul class="images">
					<li class="images__item" v-for="image in images">
						<span class="images__name">{{ image.name }}</span>
						<img class="images__img" :src="image.image.src" :width="image.image.width" :height="image.image.height" alt="?">
					</li>
				</ul>
			</div>
			<div class="col">
				<ul class="names">
					<draggable v-model="names" :options="{ group: 'names' }" @start="isDragging = true" @end="isDragging = false">
						<li class="names__item" v-for="name in names" :key="name.id">
							<button type="button" class="names__btn">{{ name.name }}</button>
						</li>
					</draggable>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	import draggable from 'vuedraggable'
	import instruments from './instruments'


	export default {
		name: 'app',
		components: {
			draggable
		},
		data() {
			return {
				isDragging: false,
				names: instruments.slice(),
				images: instruments.slice()
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
		width: 600px;
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
		color: #fff;
		mix-blend-mode: exclusion;
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
		transition: all 0.4s ease-in-out;
	}

	.names__btn {
		display: inline-block;
		margin: 0.25em;
		padding: 0.5em 1em;
		font: inherit;
		text-transform: capitalize;
		background: #eee;
		border: 0;
		-webkit-appearance: none;
		cursor: grab;

		&:active {
			cursor: grabbing;
		}
	}

</style>
