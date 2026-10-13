# SpeedTower — Game Design Brief

## Purpose and player experience

SpeedTower is a local, single-player browser platformer about improving a route through practice. Its castle extends upward indefinitely. A seed creates a repeatable course of voxel platforms on independently rotating rings. Players climb, time moving surfaces, recover falls, and spend boosts to improve their route.

The screen-centered side view has two simulated movement axes: distance around the tower's circumference and height. The character remains at a fixed radius and apparent screen depth: a 2.5D model rendered with Three.js.

The first version includes six themes, procedural sections, three boosts, local records, and seed-based retry. Multiplayer, global leaderboards, input replay, checkpoints, and a finish line are excluded. This document specifies intended behavior, not an implemented or tested game.

## Core loop and controls

Players enter or request a seed, begin on the safe base, and climb increasingly demanding sections within validated movement limits. The HUD shows active time, current/maximum height, Q/E contents, and latest split. Death offers a summary, same-course retry, or new seed.

| Input | Behavior |
|---|---|
| A / Left arrow | Move left around the tower |
| D / Right arrow | Move right around the tower |
| Space | Jump; perform a wall jump when eligible |
| Q | Attempt the boost in the first slot |
| E | Attempt the boost in the second slot |
| Escape | Pause or resume |

Opposing horizontal inputs cancel. Boosts activate on press edges; simultaneous presses resolve Q before E. Menus show controls, seed, course version, and timing status. Hazard/boost feedback uses silhouettes and symbols alongside color.

## Movement, camera, and rotating surfaces

Run the controller at a fixed simulation step. Integrate ready sections and check required terrain at the tick boundary, then snapshot input, evaluate rings, expire boosts, process Q/E, resolve movement/contact, apply world pickups/pads, update metrics, and schedule streaming. Pads applied after collision affect the next tick. Use tangential distance as the horizontal coordinate and derive the render angle from the tower radius. Periodic collision handles crossing the circumference seam without a visible discontinuity. The camera follows the player's angle and height to maintain the centered side view, with a readable view of surfaces immediately above and below.

Each ring has its own seeded phase and angular velocity. Its phase is evaluated from simulation time, so unloaded rings return to the correct position. While grounded, the character is carried by its supporting ring in addition to controlled movement. On jumping or walking off an edge, inherit that ring's tangential velocity once. A landing on another ring establishes the new support; it must not add the previous ring's velocity again.

Swept collision considers player and platform motion, preventing tunneling during dashes, opposing-ring landings, and seam crossings. Shared gameplay geometry produces collision and voxel surfaces; each rotating ring remains a separate mesh.

Wall slide slows descent against an eligible solid wall. Wall jump pushes the player upward and away from the contacted wall. Coyote time and a short jump buffer improve responsiveness, but route validation must not require either grace mechanism. Visual effects may communicate speed without obscuring the next landing surface.

| Candidate tuning | Initial value |
|---|---|
| Tower radius / voxel edge | 8 units / 1 unit |
| Player width / height | 0.7 / 1.6 units |
| Controlled move speed | 6 units/s |
| Gravity / fall speed cap | 24 units/s² / 24 units/s |
| Jump launch / air acceleration | 10 units/s / 18 units/s² |
| Fixed step | 1/120 s |
| Coyote time / jump buffer | 0.10 s / 0.12 s |
| Wall slide descent cap | 3 units/s |
| Wall jump upward / outward speed | 10 / 7 units/s |
| Dash speed / duration | 18 units/s / 0.16 s |
| High-jump launch | 14 units/s |
| Glide descent cap / duration | 3 units/s / 2 s |

These unvalidated prototype defaults are configurable game units. Tune the controller first, then derive a conservative route-validation envelope. Required jumps remain feasible without boosts.

## Boost inventory and pads

Q and E each hold one consumable charge. A world pickup fills Q first, then E. Duplicate boost types are allowed. When both slots are occupied, the pickup remains available in the world. A charge is removed only after its effect successfully activates.

| Type | Effect and successful activation |
|---|---|
| Dash | Tangential burst in the current input direction, or facing direction without input; rejects activation while dash is active |
| High jump | Sets upward velocity to the configured launch value only when that increases current upward velocity; works grounded, at a wall, or airborne |
| Glide | Caps downward velocity while airborne; rejects activation when grounded or already gliding; ends on landing or expiry |

Different types can combine: for example, glide can control descent during a dash. Repeated activation never multiplies an existing effect. An invalid activation preserves the inventory charge and provides brief HUD feedback. Two simultaneous high-jump charges therefore spend only the first if it has already established the full launch velocity.

Pads apply the same effect definitions immediately on entry. Each pad latches after an entry attempt, including an unsuccessful attempt, and cannot retrigger while the character remains inside it. A successful activation starts a 0.5-second cooldown. Rearming requires both exit and cooldown completion; an unsuccessful activation requires exit but starts no cooldown. Reentering too early remains ineligible until another exit and entry. This prevents continuous overlap from producing repeated launches or repeated invalid attempts.

## Falling, hazards, and course structure

Ordinary falls remain recoverable: lower sections stream back into memory, including when the player falls a large distance. The starting base catches nonhazard falls. There is no arbitrary death plane or checkpoint reset. Lava and clearly designated lethal hazards end the run immediately; retry rebuilds the same course from the base and clears that run's collected-item history.

Build each section around a baseline route, then add decorative voxels and optional boost shortcuts. Waiting surfaces support rotating-ring timing challenges. Difficulty increases by combining validated patterns and bounded parameters, not by increasing gaps indefinitely. A deterministic safe template replaces a candidate that fails route validation.

| Environment | Visual direction and challenge emphasis |
|---|---|
| Stone Ruins | Warm stone, broken battlements, introductory ledges and ring timing |
| Overgrown Keep | Moss and vines, wall transitions and narrow readable footholds |
| Frost Citadel | Cool crystalline masonry, deliberate timing and exposed platforms |
| Volcanic Forge | Dark metal and orange light, explicitly marked lava hazards |
| Arcane Tower | Violet light and runic surfaces, counter-rotating ring combinations |
| Storm Battlements | Wind-swept silhouettes, exposed climbs and restrained atmosphere |

Themes reuse the movement model. Visual frost, vines, or wind do not silently introduce friction or force changes. Additional mechanics need explicit requirements and route validation before introduction.

## Timing, records, and suspension

Track the greatest height reached and active elapsed time. Record each section's first upward boundary crossing once. Falling does not reduce the height watermark or replace a split. For local comparisons, higher maximum height ranks first; tied height compares the earlier first time that height was reached. Do not use the final death time as the tie-breaker.

Use a monotonic active clock with millisecond display precision. That presentation does not imply millisecond physics resolution. User pause, a hidden tab, missing required terrain, and a blocking storage operation suspend both simulation and timing. Initial preparation happens before the active clock begins. Any suspension during an active run marks its timing as interrupted; the summary makes that flag visible.

Compare local records only when course identity, movement rules, and timing flags match. Course identity includes seed and generator version, and binds the movement-rules version. Repeatable layouts are required; exact input replay and cross-machine physics identity are not. Store records and collected-item history locally. Distant collectible state survives section regeneration, while its persistent journal may grow during a long run. Active world geometry, buffers, and queued jobs must remain bounded.
