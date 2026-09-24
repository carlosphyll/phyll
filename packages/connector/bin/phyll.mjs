#!/usr/bin/env node
import { main } from "../src/cli.mjs";

const code = await main(process.argv.slice(2));
// The mcp command keeps running and answers null; every other command ends with its code.
if (code !== null) process.exitCode = code;
