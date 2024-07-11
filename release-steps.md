# Release steps

- [ ] Add release info to the `CHANGELOG.md` file
- [ ] Run `npm version <major|minor|patch>` to bump the version
- [ ] Run the `npm run release` command to create a new release (this asks you for a tag/version)
  - Changes are automatically pushed to GitHub
- [ ] Create a new release on GitHub with the tag
