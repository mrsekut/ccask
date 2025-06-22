#!/usr/bin/env bun

import { Command } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";
import { askCommand } from "./commands/ask.js";

const cli = Command.run(askCommand, {
  name: "Ask CLI",
  version: "0.1.0",
});

cli(process.argv).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
);