'use strict';

const gulptraum = require('gulptraum');

const buildSystemConfig = {
  releasePnpBuildCommand: 'grunt'
};

const buildSystem = new gulptraum.BuildSystem(buildSystemConfig);

buildSystem.config = buildSystemConfig;

const gulp = require('gulp');

buildSystem
  .registerTasks(gulp);