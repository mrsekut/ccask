import React from "react";
import { Box, Text } from "ink";

export function Header() {
	return (
		<Box borderStyle="single" paddingX={1} marginBottom={1}>
			<Box flexDirection="column" width="100%">
				<Text bold color="cyan">
					📋 ccask - AI Question Manager
				</Text>
				<Text dimColor>
					ESC: Back to menu | q: Quit (from menu) | Use ↑↓ to navigate
				</Text>
			</Box>
		</Box>
	);
}
