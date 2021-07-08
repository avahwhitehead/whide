interface SettingsDescriptor {
	useDarkTheme: boolean
}

interface VariablesDescriptor {
	cwd: string;
	safe: boolean;
	settings: SettingsDescriptor;
}

export const vars : VariablesDescriptor = {
	cwd: '.',
	safe: false,
	settings: {
		useDarkTheme: false,
	}
};