/**
 * Add a method to handle events on a compoenent
 * @return {Object} An object containing the desired method
 */
export const handleEvent = () => {
	return {
		methods: {
			/**
			 * Generic event handler which will try to call
			 * any function of type `{eventname}Handler` and
			 * which allows to use `this` as the component,
			 * because of some problems with the `foo.bind(this)`
			 * method on event handler
			 * @param  {Object} e The event's object
			 */
			handleEvent(e) {
				try {
					this[`${e.type}Handler`](e);
				} catch (e) {}
			}
		}
	};
};
