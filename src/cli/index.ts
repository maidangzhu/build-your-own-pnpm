#!/usr/bin/env node

import { Command } from 'commander';
import {
  createInstallCommand,
  createAddCommand,
  createRemoveCommand,
  createListCommand
} from './commands';

const program = new Command();

program
  .name('mini-pnpm')
  .description('一个极简版的 pnpm，用于学习包管理器的核心原理')
  .version('0.1.0');

// 注册命令
program.addCommand(createInstallCommand());
program.addCommand(createAddCommand());
program.addCommand(createRemoveCommand());
program.addCommand(createListCommand());

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 