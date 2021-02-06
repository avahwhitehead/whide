/**
 * Detect whether this code is being run in electron or not.
 * Based on: https://github.com/electron/electron/issues/2288#issuecomment-337858978
 */
export default function() : boolean {
	let userAgent = navigator.userAgent.toLowerCase();
	return userAgent.indexOf(' electron/') > -1;
}
