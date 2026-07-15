# Klo Changelog

## v0.2.5

Client:
  - Prevent content script from doing anything when no tab is captured (hopefully)
  - Add video regrab interval as a temporary fix for the content script losing the video element

## v0.2.4

Client:
  - Fix collapsible sections having empty scrollbars

## v0.2.3

Client:
  - Fix vertical scrolling in side bar
  - Allow separately ignoring manual and automatic URL change requests
  - Fix URL change request not being sent for PWAs
  - Declutter controls section

## v0.2.2

Client:
  - Fix connection state not persisting after closing side panel

## v0.2.1

Client:
  - Fix tab selection UI state not persisting after closing side panel

## v0.2.0

Client:
  - *Improved* side panel UI
  - Improvements in side panel state saving
  - Search recursively for video element, including shadow DOM
  - Manually trigger video element search
  - Add player controls
  - Synchronize URL with other clients when it changes
  - Add force sync video time and tab URL

Server:
  - Implement URL change messages

## v0.1.4

Client:
  - Add tab selection

Server:
  - Add latency measurement

## v0.1.3

Client:
  - Add popup with a button that opens the sidebar

Server:
  - Release docker image, see [the package repository](https://git.goisser.net/Benjamin/klo/packages)

## v0.1.2

Client:
  - Declare data collection permissions in manifest
  - Add icon
  - Revise footer layout

## v0.1.1

Client:
  - Add update definition file to enable automatic updates
  - Add version display in sidebar footer

## v0.1.0

Client:
  - Add sidebar ui with connection settings
  - Sign extension with AMO
  - Fix video seek infinite recursion

Server:
  - Refactor

## v0.0.0

Proof of concept
