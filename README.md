# Nova Discovery

You are an elite hackathon product engineer, UI/UX designer, AI architect and frontend developer.



Build a COMPLETE WORKING WEBSITE called:



NOVA — THE SERENDIPITY ENGINE



Competition Theme:

DISCOVER SOMETHING NEW



Purpose:

NOVA helps users discover experiences, activities, hobbies, events, places and micro-adventures that they are likely to enjoy but would not normally search for.



CORE DIFFERENTIATOR:

NOVA is NOT a generic recommendation website and NOT a chatbot.



It combines:

• Preference Match

• Novelty

• Feasibility

• Mood Fit

• Exploration Value



The key idea is:

“Don't recommend only what I already know. Help me discover what I didn't know I'd love.”



TARGET DEMO:

A judge should understand the product within 15 seconds and experience the main feature within 60 seconds.



BUILD THESE SCREENS:



1. LANDING PAGE

   Hero:

   “DISCOVER SOMETHING

   YOU DIDN'T KNOW

   YOU NEEDED.”



Subtitle:

“NOVA learns what you love — then takes you one step beyond it.”



Primary CTA:

START DISCOVERING



Secondary CTA:

SURPRISE ME



2. ONBOARDING

   Ask:

   • What are you interested in?

   • Current mood

   • Available time

   • Budget

   • Energy level

   • Solo / friend / group

   • Preferred distance



Use beautiful selectable cards instead of boring forms.



3. DISCOVERY RESULT

   Show:

   • Experience title

   • Image

   • Short description

   • Match Score

   • Novelty Score

   • Feasibility Score

   • Serendipity Score



Make Serendipity Score visually dominant.



Example:

91% MATCH

94% NEW

97% FEASIBLE



4. WHY NOVA PICKED THIS

   Show 3–5 explainable reasons based on the user's input.



Example:

✓ Matches your photography interest

✓ Fits your 90-minute window

✓ Within your budget

✓ You haven't tried this category before

✓ Introduces local history



5. EXPERIENCE PLAN

   Show:

   START → EXPLORE → CHALLENGE → DISCOVER → COMPLETE



6. FEEDBACK

   Buttons:

   Loved it

   Not for me

   Too familiar

   More like this

   Surprise me more



7. DISCOVERY DNA

   Show visual scores:

   Curiosity

   Creativity

   Adventure

   Learning

   Social



Also show:

Experiences discovered

New categories explored

Discovery streak



8. SAVED DISCOVERIES



IMPORTANT TECHNICAL DESIGN:



Create a deterministic recommendation engine.



Formula:



Final Score =

35% Preference Match



+ 25% Novelty

+ 20% Feasibility

+ 10% Mood Fit

+ 10% Exploration Value



Do NOT let an LLM randomly decide the recommendation.



Use realistic seeded experience data so the application works immediately.



Create at least 20 diverse experiences covering:

technology

photography

art

music

culture

learning

food

nature

fitness

creative activities

social activities

local exploration

micro-adventures



Each experience should have structured fields:

id

title

category

description

tags

budget

duration

energy

social_mode

novelty_categories

location_type

image

steps



Implement filtering first, scoring second.



AI should only enhance explanations and experience descriptions.



If AI/API is unavailable, the website MUST still work using deterministic fallback explanations.



DESIGN:



Create a premium competition-level consumer product.



Style:

• dark modern interface

• elegant typography

• subtle gradients

• premium cards

• subtle glass effect

• smooth micro-interactions

• strong visual hierarchy

• excellent mobile responsiveness

• polished loading states

• polished empty states

• polished error states



Do NOT make it look like:

• a generic SaaS dashboard

• a college project

• a template

• an AI chatbot

• a government portal



Use a consistent design system.



The main visual moment should be the recommendation result.



Make the SURPRISE ME button highly memorable.



IMPORTANT:

Prioritize working functionality over excessive features.



Do not add unnecessary pages.



Every interaction must work.



No placeholder buttons.



No broken routes.



No fake functionality presented as completed functionality.



Use clean reusable components.



Ensure mobile, tablet and desktop layouts work.



Add realistic seed data.



Add a demo mode so judges can reach an impressive recommendation quickly.



The final result should feel like a polished startup product suitable for a national-level competition.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nova-serendipity-engine.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/73cb31eb-f450-461c-9e48-b1b4b6bb6929).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
