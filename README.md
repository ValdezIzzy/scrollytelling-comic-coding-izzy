# Project 2 Student Hub: Lost in the Scroll

Student-facing repo for final project execution and turn-in.

## Why This Repo Uses Issues

Issues are required because they mirror real development workflow.

You will use them to:

- plan and sequence work
- track progress publicly
- report blockers with evidence
- verify final completion

## Start Here

1. Read [Start Here](docs/01-start-here.md) and follow the step-by-step issue setup
2. Open [GSAP Scroll](https://gsap.com/scroll/) and study examples
3. Track progress using [Progress Tracking Options](docs/08-progress-tracking-options.md)
4. Build, test, and check items off as you complete them
5. Submit using [Final Turn-In Spec](docs/03-final-turn-in-spec.md)

## What Is In This Repo

- [Project Completion Checklist (Reference)](docs/02-project-completion-checklist.md)
- [Final Turn-In Spec](docs/03-final-turn-in-spec.md)
- [Project Structure Suggestion](docs/04-project-structure-suggestion.md)
- [Resources](docs/05-resources.md)
- [Copy This Template](docs/06-copy-this-template.md)
- [Kickoff Assignment](docs/07-assignment-kickoff-template-and-tracking.md)
- [Progress Tracking Options](docs/08-progress-tracking-options.md)
- GitHub issue templates for progress tracking and blocker reporting

## How To Use Issues

1. Create `Project 2 Master Checklist` issue first.
2. Create all required sub-issues from templates.
3. Link sub-issues back into the master issue.
4. Use `Blocker Report` if stuck for more than 20 minutes.

# Lost in the Scroll
## Description

Lost in the Scroll is an interactive scrollytelling website that visualizes my journey of learning JavaScript through a comic-inspired narrative. Instead of presenting code concepts in a traditional instructional format, the site translates foundational programming ideas—such as variables, events, conditionals, and logic—into a visual and emotional experience that unfolds as the user scrolls.

The experience is driven by scroll-based animations using GSAP and ScrollTrigger, allowing each section to behave like a panel in a graphic novel. As users move through the page, they encounter transitions that simulate breaking panels, expanding text, and shifting environments, reinforcing the idea that learning code is not linear but layered, experimental, and sometimes chaotic.

The project is structured across core front-end files.

- HTML organizes the narrative structure and semantic layout of each section (panels, scenes, and transitions)
- CSS handles the visual identity, including layout, typography, color variables, and responsive behavior
- JavaScript powers the interactivity and animation logic, primarily through GSAP timelines and ScrollTrigger configurations

A key design choice was leaning into a grunge/comic aesthetic—using high contrast, bold typography, and dramatic motion to reflect both the frustration and excitement of learning code. The breaking panels and explosive transitions are meant to mirror moments of confusion turning into clarity, reinforcing the metaphor that code is something you build, break, and rebuild.

## Links

- Live Site: [INSERT LIVE URL]
- Repository: [INSERT GITHUB REPO URL]
- (Optional) Portfolio: [INSERT PORTFOLIO LINK]

## Tech Stack

- HTML5
- CSS3
- JavaScript
- GSAP (GreenSock Animation Platform)
- ScrollTrigger
- ScrollSmoother

## Reflection
### Metaphor Summary

This project uses the metaphor of a scrolling comic narrative to represent the process of learning JavaScript. Each section acts as a panel that visually interprets concepts like variables as “building blocks,” conditionals as “branching paths,” and events as “triggers” that cause change. The breaking and shifting panels symbolize moments of confusion and breakthrough, reinforcing the idea that learning to code is not clean or linear, but instead a dynamic process of trial, error, and discovery.

### Section I’m Most Proud Of

The section I’m most proud of is the panel-breaking transition into the text expansion scene. This moment feels like a true payoff in the experience because it combines multiple animation layers—timing, scale, and visual contrast—to create a dramatic shift in both mood and meaning. The transition from structured panels into a full-screen expansion reinforces the idea of a mental breakthrough, where everything suddenly “clicks.” It’s where the narrative and the interaction feel the most aligned.

### Technical Bug I Solved

One of the most challenging issues I faced was timing conflicts between scroll-triggered animations, where elements were appearing too early or overlapping incorrectly in the viewport. Specifically, the panel-breaking animation and the next section were triggering at the same time, causing visual glitches and disrupting the flow.

I solved this by refining my ScrollTrigger start and end values, adjusting trigger positions relative to the viewport, and sequencing animations more intentionally within a GSAP timeline. I also made sure elements were properly positioned and pinned so that animations occurred only when they were fully in view, which significantly improved both performance and clarity.

### Accessibility Decision

One accessibility decision I made was ensuring text readability and contrast throughout the experience. Because the design uses bold visuals and animated transitions, I made sure that text remains legible against backgrounds by maintaining high contrast and avoiding overly complex overlays behind important content.

I also structured the HTML with semantic elements to support screen readers and improve overall document structure, making the experience more accessible beyond just visual interaction.

### What I Would Improve With More Time

With more time, I would improve both the responsiveness and user control of animations. Currently, the experience is optimized for a specific screen size, but I would refine breakpoints and scaling behaviors to ensure the animations translate smoothly across all devices.

Lastly, I would continue refining animation timing and transitions to make the experience feel even more polished and intentional.
