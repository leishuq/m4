# M4: Distributed Storage

> Full name: `Leishu Qiu`
> Email: `leishu_qiu@brown.edu`
> Username: `lqiu13`

## Summary

> Summarize your implementation, including key challenges you encountered

My implementation comprises `2` new software components, totaling `400` added lines of code over the previous implementation. Key challenges included `correctly store objects with idential key in its correct node`.

## Correctness & Performance Characterization

> Describe how you characterized the correctness and performance of your implementation

_Correctness_: I wrote `5` tests; these tests take `0.757s` to execute.

_Performance_: Storing and retrieving 1000 5-property objects using a 3-node setup results in following average throughput and latency characteristics: `674.6`obj/sec and `1.10` (ms/object) (Note: these objects were pre-generated in memory to avoid accounting for any performance overheads of generating these objects between experiments).

## Key Feature

> Why is the `reconf` method designed to first identify all the keys to be relocated and then relocate individual objects instead of fetching all the objects immediately and then pushing them to their corresponding locations?

## Time to Complete

> Roughly, how many hours did this milestone take you to complete?

Hours: `16`
