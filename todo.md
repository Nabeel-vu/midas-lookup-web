# Optimization checklist

- [x] Measure uncached and cached lookup latency before changes.
- [x] Identify avoidable homepage/token fetches and signing initialization costs.
- [x] Implement safe server-side caching and reuse without sharing player-specific request state.
- [x] Reduce server-side lookup latency while preserving the existing client cache-first behavior.
- [x] Benchmark all supplied IDs and confirm arbitrary-ID correctness.
- [x] Run type-check, production build, and final regression tests.
