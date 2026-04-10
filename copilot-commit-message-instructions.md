# Commit Message Rules

Follow the seven rules of a great Git commit message:

1. **Separate subject from body with a blank line** — If a body is needed, leave one blank line between the subject and the body. Many Git tools rely on this separation.
2. **Limit the subject line to 50 characters** — 50 is a guideline; 72 is the hard limit. Keep it concise and readable.
3. **Capitalize the subject line** — Begin the subject with a capital letter (e.g. `Fix bug` not `fix bug`).
4. **Do not end the subject line with a period** — Trailing punctuation wastes space and is unnecessary.
5. **Use the imperative mood in the subject line** — Write as if giving a command: `Add feature`, `Fix bug`, `Remove unused code`. A good test: "If applied, this commit will _your subject line here_."
6. **Wrap the body at 72 characters** — Git never wraps text automatically; wrap manually at 72 characters.
7. **Use the body to explain what and why vs. how** — Focus on the reason for the change and its effects, not the implementation details (the code explains the how).

## Example

```
Summarize changes in around 50 characters or less

More detailed explanatory text, if necessary. Wrap it to about 72
characters or so. Explain the problem that this commit is solving.
Focus on why you are making this change as opposed to how.

Further paragraphs come after blank lines.

 - Bullet points are okay, too
 - Use a hyphen or asterisk, preceded by a single space

Resolves: #123
See also: #456, #789
```
