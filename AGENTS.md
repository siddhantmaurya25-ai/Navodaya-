# Project execution notes

## Execution loop

1. Understand the requested change and inspect the relevant source.
2. Implement the change in the project.
3. Run focused checks, then the available project checks.
4. Review generated output and report any external prerequisites.
5. Keep unrelated generated assets and user data unchanged.
6. **Brand-asset pass:** Never `wait_tasks` on the brand task; never `get_task_output` from it.
7. Finish with a concise status and handoff.

If a brand pass is underway, its marker is `/workspace/.grok/og-pending`. Treat it as in progress only while fresh; it becomes stale after 10 minutes. Never infer completion from the marker alone.
