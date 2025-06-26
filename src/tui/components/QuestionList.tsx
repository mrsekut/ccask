import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { getAllQuestions } from "../../core/question-manager.js";
import { formatStatus } from "../../utils/formatter.js";
import type { Question, QuestionStatus } from "../../types/index.js";
import type { Screen, AppState } from "../App.js";

type QuestionListProps = {
	questions: Question[];
	filters: AppState["filters"];
	onNavigate: (screen: Screen, question?: Question) => void;
	onUpdateQuestions: (questions: Question[]) => void;
	onUpdateFilters: (filters: AppState["filters"]) => void;
};

export function QuestionList({
	questions,
	filters,
	onNavigate,
	onUpdateQuestions,
	onUpdateFilters,
}: QuestionListProps) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showFilters, setShowFilters] = useState(false);
	const [filterIndex, setFilterIndex] = useState(0);

	const statusOptions = ["all", "pending", "generating", "completed", "failed"];

	// Load questions on mount and periodically refresh
	useEffect(() => {
		const loadQuestions = async () => {
			try {
				const allQuestions = await getAllQuestions();
				onUpdateQuestions(allQuestions);
			} catch (error) {
				console.error("Failed to load questions:", error);
			}
		};

		loadQuestions();
		const interval = setInterval(loadQuestions, 2000); // Refresh every 2 seconds
		return () => clearInterval(interval);
	}, [onUpdateQuestions]);

	// Apply filters
	const filteredQuestions = questions.filter((q) => {
		if (filters.status !== "all" && q.status !== filters.status) return false;
		if (filters.recent) {
			const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
			if (new Date(q.createdAt) <= oneDayAgo) return false;
		}
		return true;
	});

	// Calculate stats
	const stats = {
		pending: questions.filter((q) => q.status === "pending").length,
		generating: questions.filter((q) => q.status === "generating").length,
		completed: questions.filter((q) => q.status === "completed").length,
		failed: questions.filter((q) => q.status === "failed").length,
	};

	useInput((input, key) => {
		// Handle filter mode
		if (showFilters) {
			if (key.upArrow) {
				setFilterIndex((prev) => (prev > 0 ? prev - 1 : statusOptions.length));
				return;
			}
			
			if (key.downArrow) {
				setFilterIndex((prev) => (prev < statusOptions.length ? prev + 1 : 0));
				return;
			}
			
			if (key.return) {
				if (filterIndex === statusOptions.length) {
					// Toggle recent filter
					onUpdateFilters({ ...filters, recent: !filters.recent });
				} else {
					// Set status filter
					const selectedStatus = statusOptions[filterIndex];
					if (selectedStatus) {
						onUpdateFilters({ ...filters, status: selectedStatus });
					}
				}
				setShowFilters(false);
				return;
			}
			
			if (input === "f" || key.escape) {
				setShowFilters(false);
				return;
			}
			
			return;
		}

		// Handle normal navigation mode
		if (key.upArrow && filteredQuestions.length > 0) {
			setSelectedIndex((prev) =>
				prev > 0 ? prev - 1 : filteredQuestions.length - 1
			);
			return;
		}

		if (key.downArrow && filteredQuestions.length > 0) {
			setSelectedIndex((prev) =>
				prev < filteredQuestions.length - 1 ? prev + 1 : 0
			);
			return;
		}

		if (key.return && filteredQuestions.length > 0 && filteredQuestions[selectedIndex]) {
			onNavigate("detail", filteredQuestions[selectedIndex]);
			return;
		}

		if (input === "f") {
			setShowFilters(true);
			return;
		}

		if (input === "r") {
			// Refresh questions
			getAllQuestions().then(onUpdateQuestions);
			return;
		}
	});

	if (showFilters) {
		return (
			<Box flexDirection="column" paddingX={2}>
				<Box marginBottom={1}>
					<Text bold>Filters:</Text>
				</Box>

				{statusOptions.map((status, index) => (
					<Box key={status} marginBottom={1}>
						<Text color={index === filterIndex ? "green" : "white"}>
							{index === filterIndex ? "→ " : "  "}
							Status: {status} {filters.status === status ? "✓" : ""}
						</Text>
					</Box>
				))}

				<Box marginBottom={1}>
					<Text
						color={filterIndex === statusOptions.length ? "green" : "white"}
					>
						{filterIndex === statusOptions.length ? "→ " : "  "}
						Recent (24h): {filters.recent ? "ON ✓" : "OFF"}
					</Text>
				</Box>

				<Box marginTop={1}>
					<Text dimColor>Press Enter to toggle, f or ESC to close filters</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingX={2}>
			<Box marginBottom={1}>
				<Text bold>Questions ({new Date().toLocaleString()})</Text>
			</Box>

			<Box marginBottom={1}>
				<Text>
					📈 Stats: Pending: {stats.pending} | Generating: {stats.generating} |
					Completed: {stats.completed} | Failed: {stats.failed}
				</Text>
			</Box>

			{(filters.status !== "all" || filters.recent) && (
				<Box marginBottom={1}>
					<Text color="yellow">
						🔍 Filters:{" "}
						{filters.status !== "all" ? `Status: ${filters.status}` : ""}{" "}
						{filters.recent ? "Recent (24h)" : ""}
					</Text>
				</Box>
			)}

			{filteredQuestions.length === 0 ? (
				<Text>No questions found</Text>
			) : (
				<Box flexDirection="column">
					{filteredQuestions.map((question, index) => (
						<Box key={question.id} marginBottom={1}>
							<Text color={index === selectedIndex ? "green" : "white"}>
								{index === selectedIndex ? "→ " : "  "}
								{formatStatus(question.status)} {question.term}
							</Text>
							{index === selectedIndex && (
								<Text dimColor> (Press Enter to view details)</Text>
							)}
						</Box>
					))}
				</Box>
			)}

			<Box marginTop={1}>
				<Text dimColor>f: Filters | r: Refresh | Enter: View details</Text>
			</Box>
		</Box>
	);
}
