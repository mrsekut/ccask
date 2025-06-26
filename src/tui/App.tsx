import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { MainMenu } from './components/MainMenu.js';
import { QuestionList } from './components/QuestionList.js';
import { QuestionDetail } from './components/QuestionDetail.js';
import { AskQuestion } from './components/AskQuestion.js';
import { Header } from './components/Header.js';
import type { Question } from '../types/index.js';

export type Screen = 'menu' | 'list' | 'detail' | 'ask';

export interface AppState {
	screen: Screen;
	selectedQuestion?: Question;
	questions: Question[];
	filters: {
		status: string;
		recent: boolean;
	};
}

export function App() {
	const { exit } = useApp();
	const [state, setState] = useState<AppState>({
		screen: 'menu',
		questions: [],
		filters: {
			status: 'all',
			recent: false,
		},
	});

	useInput((input, key) => {
		if (input === 'q' && state.screen === 'menu') {
			exit();
		}
		if (key.escape) {
			setState(prev => ({ ...prev, screen: 'menu', selectedQuestion: undefined }));
		}
	});

	const navigateToScreen = (screen: Screen, question?: Question) => {
		setState(prev => ({ 
			...prev, 
			screen, 
			selectedQuestion: question 
		}));
	};

	const updateQuestions = (questions: Question[]) => {
		setState(prev => ({ ...prev, questions }));
	};

	const updateFilters = (filters: AppState['filters']) => {
		setState(prev => ({ ...prev, filters }));
	};

	return (
		<Box flexDirection="column" height="100%">
			<Header />
			
			{state.screen === 'menu' && (
				<MainMenu onNavigate={navigateToScreen} />
			)}
			
			{state.screen === 'list' && (
				<QuestionList
					questions={state.questions}
					filters={state.filters}
					onNavigate={navigateToScreen}
					onUpdateQuestions={updateQuestions}
					onUpdateFilters={updateFilters}
				/>
			)}
			
			{state.screen === 'detail' && state.selectedQuestion && (
				<QuestionDetail
					question={state.selectedQuestion}
					onNavigate={navigateToScreen}
				/>
			)}
			
			{state.screen === 'ask' && (
				<AskQuestion onNavigate={navigateToScreen} />
			)}
		</Box>
	);
}