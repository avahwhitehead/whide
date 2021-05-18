import { InputPromptTypes } from "@/types";
import { CustomDict } from "@/types/CustomDict";

export type Menu = {
	name: string,
	children: (Menu|MenuItem)[],
};

export type MenuItem = {
	name: string,
	args?: CommandArgument[],
	command: (props: { args: CustomDict<string> }) => void,
};

export type CommandArgument = {
	name: string,
	description?: string,
	type?: InputPromptTypes,
	default?: string,
	validator?: (v: string) => boolean | Promise<boolean>
};