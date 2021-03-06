import { _wrapCodeMirrorDoc } from "@/types/codeEditor/_CodeMirrorDocWrapper";
import { _wrapCodeMirrorEditor } from "@/types/codeEditor/_CodeMirrorEditorWrapper";
import CodeMirror from "codemirror";
import { CodeEditorWrapper } from "@whide/whide-types/";

/**
 * Build an asynchronous wrapper around a code editor object so that it can be used in plugins.
 * This is required due to a "quirk" of electron's {@code remote.require} method which runs all callback functions as
 * asynchronous even if they are not.
 *
 * See: https://trello.com/c/mWblT66d and https://www.electronjs.org/docs/api/remote#passing-callbacks-to-the-main-process
 *
 * @param _editor	The editor object to wrap
 */
export function wrapEditor(_editor : CodeMirror.Editor) : CodeEditorWrapper {
	return {
		//Wrap the methods provided by `CodeMirror.Doc`
		..._wrapCodeMirrorDoc(_editor),
		//Wrap the remaining methods provided by `CodeMirror.Editor`
		..._wrapCodeMirrorEditor(_editor),
	}
}