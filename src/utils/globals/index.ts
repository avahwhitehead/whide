import checkIsElectron from "@/types/isElectron";

export const isElectron : boolean = checkIsElectron();

interface VariablesDescriptor {
	cwd: string;
	safe: boolean;
}

export const vars : VariablesDescriptor = {
	cwd: '.',
	safe: false,
};