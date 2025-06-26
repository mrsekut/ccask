import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { startBackgroundGeneration } from '../../core/background-processor.js';
import type { Screen } from '../App.js';

interface AskQuestionProps {
	onNavigate: (screen: Screen) => void;
}

export function AskQuestion({ onNavigate }: AskQuestionProps) {
	const [question, setQuestion] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState('');

	useInput(async (input, key) => {
		if (key.return && !isSubmitting && question.trim()) {
			setIsSubmitting(true);
			setMessage('Starting background generation...');
			
			try {
				await startBackgroundGeneration(question.trim());
				setMessage('✓ Question submitted successfully! Generation started in background.');
				setTimeout(() => {
					onNavigate('list');
				}, 1500);
			} catch (error) {
				setMessage(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
				setIsSubmitting(false);
			}
		} else if (key.backspace && !isSubmitting) {
			setQuestion(prev => prev.slice(0, -1));
		} else if (key.ctrl && input === 'c') {
			onNavigate('menu');
		} else if (!key.ctrl && !key.meta && !key.return && !key.backspace && !key.tab && !isSubmitting) {
			setQuestion(prev => prev + input);
		}
	});

	return (
		<Box flexDirection="column" paddingX={2}>
			<Box marginBottom={1}>
				<Text bold>
					Ask a new question:
				</Text>
			</Box>
			
			<Box marginBottom={1}>
				<Text>Question: </Text>
				<Text color="cyan">{question}</Text>
				<Text>{!isSubmitting ? '█' : ''}</Text>
			</Box>
			
			{message && (
				<Box marginBottom={1}>
					<Text color={message.startsWith('✓') ? 'green' : message.startsWith('✗') ? 'red' : 'yellow'}>
						{message}
					</Text>
				</Box>
			)}
			
			{!isSubmitting && (
				<Box marginTop={1}>
					<Text dimColor>
						Type your question and press Enter to submit
					</Text>
				</Box>
			)}
		</Box>
	);
}