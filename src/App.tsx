import { useState } from 'react';
import { Box, useInput, useApp } from 'ink';
import {
  MainMenu,
  Header,
  type Screen,
  type AppState,
} from './features/navigation/index.js';
import {
  QuestionList,
  QuestionDetail,
  AskQuestion,
  type Question,
} from './features/questions/index.js';

export function App() {
  const { exit } = useApp();
  const [state, setState] = useState<AppState>({
    screen: 'menu',
    questions: [],
  });

  useInput((input, key) => {
    if (input === 'q' && state.screen === 'menu') {
      exit();
    }
    if (key.escape) {
      setState(prev => ({
        ...prev,
        screen: 'menu',
        selectedQuestion: undefined,
      }));
    }
  });

  const navigateToScreen = (screen: Screen, question?: Question) => {
    setState(prev => ({
      ...prev,
      screen,
      selectedQuestion: question,
    }));
  };

  const updateQuestions = (questions: Question[]) => {
    setState(prev => ({ ...prev, questions }));
  };

  return (
    <Box flexDirection="column" height="100%">
      <Header />

      {state.screen === 'menu' && <MainMenu onNavigate={navigateToScreen} />}

      {state.screen === 'list' && (
        <QuestionList
          questions={state.questions}
          onNavigate={navigateToScreen}
          onUpdateQuestions={updateQuestions}
        />
      )}

      {state.screen === 'detail' && state.selectedQuestion && (
        <QuestionDetail
          question={state.selectedQuestion}
          onNavigate={navigateToScreen}
        />
      )}

      {state.screen === 'ask' && <AskQuestion onNavigate={navigateToScreen} />}
    </Box>
  );
}
