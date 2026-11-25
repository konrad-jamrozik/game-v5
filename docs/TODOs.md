# TODOs

Work the Game designer has set aside for later. This list is not a specification and owns no rules. An item is removed once it is done.

- Review the CR Sweep Bench, described in `tools/cr-sweep-bench/README.md`: read how its yardstick and its experiments work, run it with `npm run sweep:bench`, and try formulas in it, to understand what it shows about a Combat rating formula. It was built, and its first readings were discussed, in the T3 thread "Combat Rating Formula Calibration", thread ID `6664326e-82ae-4710-b1a5-24a101803ff6`. Two questions from that thread are still open: whether the safe ratio may depend on the size of the fight, and whether to build a formula from the measured curves.
- Settle the open decisions left from slimming the specifications, in the T3 thread "Merging Spec and Code Repositories", thread ID `82296efa-3238-472a-9f0e-8ceb41fe87d2`. The 14 decisions the code cannot settle are on the page "Fourteen open specification decisions", <https://claude.ai/artifact/PDobEiPRZ1Vvh3Gr6ix6Ru>, each with a recommendation. Four changes are recommended and not yet applied:
  - Combat: state that an attacking Agent gains more combat experience from a hit than from a miss, and a defending Agent more from a miss than from a hit.
  - Basic Autopilot AI: drop the sentence that developer tooling can build the Basic Autopilot AI with other Tuning parameter values.
  - GDRs: say that each Faction operation level is served by at least three MissionSiteArchetypes of kind response, rather than exactly three.
  - GDRs: rename the heading "GDR catalog" to "Content intent".
- Settle what the Compendium View shows for Equipment: its specification describes an Ammo data sheet and the "Ammo" and "Price" rows of Weapons and the "Price" row of Armors, which the game does not draw. Either the game draws them or the specification drops them. Raised in the same thread.
