import { on, off, once } from 'sm-events';
import { handleEvent } from './handleEvent';
import { log } from '@/utils';

export const pointer = () => {
	return {
		mixins: [handleEvent()],
		data() {
			return {
				pointer: {
					x: 0,
					y: 0
				}
			};
		},
		methods: {
			/**
			 * Handler for the `mousedown` event on a name
			 *
			 * @param  {Object} name  The target name
			 * @param  {Object} event The event's object
			 */
			mousedownHandler(event) {
				log('mousedownHandler');

				this.pointer.x = event.clientX;
				this.pointer.y = event.clientY;

				log(this.pointer.x, this.pointer.y);

				on(document, 'mousemove', this);
				once(document, 'mouseup', e => {
					off(document, 'mousemove', this);
					log(this.pointer.x, this.pointer.y);
				});
			},

			/**
			 * Update pointer position on mouse move
			 *
			 * @param  {Object} event The event's object
			 */
			mousemoveHandler(event) {
				this.pointer.x = event.clientX;
				this.pointer.y = event.clientY;
			},

			/**
			 * Handler for the `touchstart` event on a name
			 *
			 * @param  {Object} name  The target name
			 * @param  {Object} event The event's object
			 */
			touchstartHandler(event) {
				log('touchstartHandler');

				const touch = event.touches[0];
				this.pointer.x = touch.clientX;
				this.pointer.y = touch.clientY;

				on(document, 'touchmove', this);
				once(document, 'touchend', e => {
					off(document, 'touchmove', this);
					log(this.pointer.x, this.pointer.y);
				});
			},

			/**
			 * Update pointer position on touch move
			 *
			 * @param  {Object} event The event's object
			 */
			touchmoveHandler(event) {
				const touch = event.touches[0];
				this.pointer.x = touch.clientX;
				this.pointer.y = touch.clientY;
			}
		},
		created() {
			log('pointer mixin created');
			document.addEventListener('mousedown', this, true);
			document.addEventListener('touchstart', this, true);
		},
		destroyed() {
			log('pointer mixin destroyed');
			off(document, 'mousedown', this);
			off(document, 'touchstart', this);
		}
	};
};
