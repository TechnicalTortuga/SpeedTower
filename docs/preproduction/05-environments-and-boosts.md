# Environments and Boost Catalogue

Six environments reuse one movement model and hand-tested challenge patterns (FR-10); boosts implement FR-11–16. See [Requirements](02-requirements.md). Colours and numbers are art and tuning candidates.

## Environment direction

Use four-section theme blocks. For the ordered catalogue below, select `(seed % 6 + floor(sectionIndex / 4)) % 6`; repeat indefinitely. Themes transition at the shared stationary landing. Blend scenery/light colour without changing physics. Preserve readable landing tops, wall-slide surfaces, boosts, and lethal warnings.

| Environment | Palette candidates | Visual and challenge direction |
|---|---|---|
| Stone Ruins | Stone `#777A80`, charcoal `#272A30`, torch `#FFBC63` | Broken crenellations, wide stone tops, and open sightlines teach ring carry, short gaps, and wall jumps. |
| Overgrown Keep | Moss `#527A4F`, stone `#777260`, leaf `#9ABA67` | Vines and arches frame staggered platforms and alternating rings; route surfaces stay free of foliage. |
| Frost Citadel | Ice `#B8E5F1`, slate `#4E6984`, accent `#E8FAFF` | Sharp crystal silhouettes and cool light surround longer waits and narrow, high-contrast landings. |
| Volcanic Forge | Basalt `#37313C`, lava `#FF643A`, metal `#A08A78` | Thick anvils, furnace vents, and lit crossings frame explicit lethal lava gaps. |
| Arcane Tower | Violet `#6650A7`, midnight `#272A51`, rune `#78E1DD` | Floating-looking voxel supports and rune strips frame alternating directions and wall-jump chains. |
| Storm Battlements | Blue-grey `#526A7A`, cloud `#B8C8D1`, amber `#FFD16B` | Large battlement silhouettes, cloud parallax, and visible ring edges support demanding timing sequences. |

Candidate rotation ranges below are magnitudes in rad/s at full difficulty. A seeded direction belongs to each ring; ramps scale within the configured limits, and designated waiting platforms remain stationary. The global cap remains 0.5 rad/s.

| Theme | Rotation range / pattern | Hazard and optional shortcut |
|---|---|---|
| Stone Ruins | 0.10–0.18; simple same-direction pairs | Clearly marked spikes away from waiting zones; dash crosses a shorter optional loop. |
| Overgrown Keep | 0.08–0.16; gentle opposite pairs | Visible thorn blocks use the standard lethal-hazard rule; high jump skips an arch ascent. |
| Frost Citadel | 0.12–0.22; offset alignment windows | Marked spike crystals; glide recovers onto a lower ledge. Ice is cosmetic initially. |
| Volcanic Forge | 0.16–0.28; interrupted platform arcs | Luminous lava surfaces kill on contact; dash offers an optional crossing alongside a baseline route. |
| Arcane Tower | 0.18–0.35; alternating ring directions | Always-visible lethal rune blocks; high jump bypasses an optional wall chain. |
| Storm Battlements | 0.22–0.40; mixed timing patterns | Marked lethal conductors; glide accesses a broad lower shortcut. Wind and lightning remain visual effects. |

Use the same hazard-contact rule across themes, with distinct silhouettes. Slippery movement, gust forces, timed damage, and reduced visibility require separate rules and tests. Darkness must preserve landing contrast. Icons and shapes supplement boost/hazard colours (TC-14).

## Shared boost definitions

Items and level pads invoke the same `BoostDefinition` and activation path. Q and E are independent one-item slots. A pickup fills Q first, then E; duplicate types are allowed. If both are occupied, leave the pickup present. Resolve simultaneous Q/E requests in Q-then-E order using the state resulting from the first activation. Consume a slot only after its effect successfully activates (TC-09).

| Boost | Candidate effect | Activation rule and failure |
|---|---|---|
| Dash | Set self horizontal speed to 18 units/s for 0.16 s; preserve vertical velocity | Use held movement direction, otherwise facing. Respect swept collision and the 26-unit/s total cap. Reject while a dash is active. |
| High jump | Set vertical velocity to +14 units/s | Available grounded, wall-sliding, or airborne, including during descent. Succeed only if this increases current vertical velocity; otherwise retain the item. |
| Glide | Cap descent at 3 units/s for 2 s | Activate only airborne or wall-sliding. End on landing or expiry. Reject while already active or grounded. |

While grounded, dash sets relative tangential speed to the signed 18-unit/s target, then adds the support ring speed to obtain world `vx`. An airborne dash replaces world `vx` with the signed 18-unit/s target; it replaces previously inherited tangential momentum and preserves vertical motion. Ordinary takeoff without a dash retains the already computed world velocity rather than adding ring speed twice.

When dash meets a wall, stop horizontal motion through the ordinary collision response; the effect timer continues to expiry. High jump detaches from its supporting surface and retains world tangential velocity under the normal departure rule. Glide clamps downward velocity only, so it does not cancel an upward jump. Effects advance on simulation ticks and freeze during suspension.

Different boost types can coexist. Apply the vertical impulse, then persistent effect constraints during each tick: high jump sets upward velocity, dash controls horizontal speed, and glide limits descent. Glide continues across a high jump until landing or expiry. A second high jump can succeed after vertical velocity drops below 14 units/s, but never stacks impulses above that value. Dash and glide do not multiply or extend an already active effect (TC-06–08).

Pads activate on trigger entry. Rearming requires complete exit and expiry of the **0.5-second simulation-time cooldown** started by success. Failed entry also requires exit before retry. Pads are reusable, consume no inventory, and follow input-before-contact ordering from the architecture. Only success starts cooldown (TC-10).

## Placement, feedback, and balance

Required routes remain traversable with baseline movement. Put pickups on visible approach surfaces and pads on deliberately signposted shortcuts. Reserve enough space to see the destination before committing to dash; glide shortcuts need a viable lower landing. Do not place a required pad at an impossible-to-repeat timing window or use a pickup to compensate for a failed baseline route.

Keep world presentation consistent across items and pads: dash uses a forward-chevron icon, high jump an upward arrow, and glide a wing icon. Candidate accents are dash `#F3AF49`, high jump `#77DA94`, and glide `#80CAF3`. The HUD shows both slot keys, held icons, and active-effect progress. Successful activation gives brief visual/audio feedback; rejected activation leaves the slot unchanged and gives a subtle unavailable cue. Speed effects must preserve platform edges.

Milestone 1 establishes baseline jump height, airtime, wall movement, and ring interaction; Milestone 3 tunes boost duration/speed and placement against those measurements. Record each change in the movement-rules version. Validate duplicates, full inventory, airborne high jump, combined glide/dash, maximum-speed collision, and pad reentry before enabling procedural placements. [Roadmap and Validation](07-roadmap-and-validation.md) defines the future tests; this catalogue does not report completed gameplay verification.
