/**
 * Return a shuffled copy of an array
 *
 * @param  {Array} array The array to shuffle
 * @return {Array}     The shuffled array
 */
export function shuffleArray(array) {
	return array.slice().sort(() => 0.5 - Math.random());
}
