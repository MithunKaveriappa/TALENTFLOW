-- Unbiased Psychometric Questions Seed Script
-- Experience Band: Senior (5-10 Years)
-- Drivers: Burnout Risk, Growth Potential, Sales DNA
-- Implementation: Intent-based rubrics for Gemini 1.5 Flash evaluation

-- ------------------------------------------------------------------------------------------------
-- 1. BURNOUT RISK (EASY - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'senior', 'low', 'Tell me about handling leadership-related pressure.', 'Score 6: Perspective and composure. Candidate describes viewing pressure as a function of the role and uses professional detachment to stay objective.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'Describe managing workload complexity.', 'Score 6: Strategic prioritization. Candidate explains how they categorize tasks by ROI and impact, delegating or deferring low-value complexity.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'How do you maintain energy during extended projects?', 'Score 6: Pacing logic. Candidate describes breaking long-term initiatives into "energy phases" and building in recovery windows to prevent depletion.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'Tell me about balancing strategy and execution.', 'Score 6: Balanced workflow. Candidate shows they protect "thinking time" for strategy while maintaining systems for execution oversight.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'Describe coping with accountability stress.', 'Score 6: Ownership maturity. Candidate views accountability as a professional standard and uses data/processes to ensure outcomes rather than worrying.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'How do you manage fatigue during continuous demand cycles?', 'Score 6: Structural resilience. Candidate describes a specific lifestyle or professional system (e.g., deep-work blocks) that makes constant demand manageable.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'Tell me about staying composed under responsibility.', 'Score 6: Emotional stability. Candidate shares a technique for maintaining a "steady hand" for their team even when metrics are under pressure.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'Describe maintaining performance consistency.', 'Score 6: Process-driven output. Candidate relies on robust professional habits and standard operating procedures rather than fluctuating motivation.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'How do you recover from high-demand quarters?', 'Score 6: Strategic reset. Candidate describes a formal "debrief and recharge" process that clears the mental slate for the next cycle.'),
('psychometric', 'burnout_risk', 'senior', 'low', 'Tell me about balancing professional intensity with personal life.', 'Score 6: Boundary leadership. Candidate explains how they set clear expectations with both family and work stakeholders to maintain a high-performance lifestyle.');

-- ------------------------------------------------------------------------------------------------
-- 2. BURNOUT RISK (MEDIUM - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'senior', 'medium', 'Tell me about decision fatigue during high-responsibility periods.', 'Score 6: Cognitive management. Candidate identifies when their decision quality is dropping and uses "pre-decided rules" or sleep-proxies to mitigate risk.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'Describe managing emotional exhaustion while leading others.', 'Score 6: EQ and role-modeling. Candidate describes setting healthy emotional boundaries to stay supportive of others without absorbing their stress.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'How do you prevent stress from impacting leadership effectiveness?', 'Score 6: Shielding logic. Candidate explains how they process their own stress privately to ensure their team sees a calm, logical version of leadership.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'Tell me about handling cumulative accountability.', 'Score 6: Scaling shoulders. Candidate describes the transition of being responsible for many people/outcomes and how they upgraded their mental "RAM" to handle the load.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'Describe maintaining clarity under complexity.', 'Score 6: Simplification skill. Candidate describes using frameworks or models to strip away noise and focus on the "lead indicators" that matter most.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'How do you sustain resilience across multiple years of pressure?', 'Score 6: Longitudinal health. Candidate shares a multi-year philosophy on career longevity, treating themselves as a "high-performance asset" that requires maintenance.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'Tell me about navigating prolonged organizational change.', 'Score 6: Change endurance. Candidate describes keeping themselves (and others) focused on the long-term mission even when the mid-term path is chaotic.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'Describe managing performance expectations from multiple stakeholders.', 'Score 6: Conflict orchestration. Candidate describes aligning diverse stakeholders to a single reality, preventing the "pulling in ten directions" fatigue.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'How do you protect engagement during strategic transitions?', 'Score 6: Mission re-alignment. Candidate describes finding the "New Value" in a transition to stay personally excited and professionally committed.'),
('psychometric', 'burnout_risk', 'senior', 'medium', 'Tell me about stress affecting long-term motivation.', 'Score 6: Self-correction. Candidate describes a time motivation dipped and the specific "values-audit" they performed to reconnect to their career purpose.');

-- ------------------------------------------------------------------------------------------------
-- 3. BURNOUT RISK (HARD - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'senior', 'hard', 'Tell me about emotional detachment as a coping mechanism.', 'Score 6: Professional stoicism. Candidate explains how to use objectivity to protect peace of mind without losing empathy or operational care.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'Describe managing chronic burnout symptoms.', 'Score 6: radical intervention. Candidate describes recognizing deep signs of exhaustion and making a high-stakes change (e.g., sabbatical or role-restructure) to save their career.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'How do you sustain leadership under sustained strain?', 'Score 6: Endurance leadership. Candidate shares their system for leading a team through a multi-month or multi-year "siege" without breaking the culture or themselves.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'Tell me about pressure impacting career satisfaction.', 'Score 6: Philosophical maturity. Candidate shows they can differentiate between "hard days" and a "wrong career," using pressure as data for better alignment.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'Describe recovering from extended exhaustion cycles.', 'Score 6: Deep recovery. Candidate describes the "re-entry" process after burnout—learning to work with a new set of sustainable boundaries.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'How do you prevent cumulative stress from reducing effectiveness?', 'Score 6: Systems upgrade. Candidate describes a moment they realized "old ways" wouldn''t work at their new level of stress and the structural upgrade they made to their workflow.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'Tell me about the most exhausting phase of your mid-career.', 'Score 6: Grit and Growth. Candidate shares a "war story" where they pushed TO the limit, survived, and built a better system to ensure they never have to push that way again.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'Describe balancing ambition with well-being.', 'Score 6: Optimal performance logic. Candidate argues that well-being *is* the fuel for ambition, not an alternative to it, and provides evidence of this balance.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'How do you manage persistent high expectations?', 'Score 6: Expectation management. Candidate describes defining "what success looks like" clearly with leadership to ensure expectations remain challenging but grounded in reality.'),
('psychometric', 'burnout_risk', 'senior', 'hard', 'Tell me about safeguarding long-term resilience.', 'Score 6: Future-proofing health. Candidate describes their "Board of Directors"—mentors, routines, and habits—that protect their professional longevity.');

-- ------------------------------------------------------------------------------------------------
-- 4. GROWTH POTENTIAL (EASY - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'senior', 'low', 'Tell me about expanding into broader responsibilities.', 'Score 6: Generalist evolution. Candidate describes moving from "Doing" to "Overseeing," showing a desire to understand the whole business engine.'),
('psychometric', 'growth_potential', 'senior', 'low', 'Describe strengthening leadership capabilities.', 'Score 6: Deliberate practice. Candidate identifies a specific leadership soft-skill (e.g., coaching) and describes the intentional steps they took to master it.'),
('psychometric', 'growth_potential', 'senior', 'low', 'How do you adapt to evolving strategic expectations?', 'Score 6: Strategic agility. Candidate describes greeting a shift in business direction with curiosity and immediate tactical adjustment.'),
('psychometric', 'growth_potential', 'senior', 'low', 'Tell me about investing in professional development.', 'Score 6: ROI-based learning. Candidate explains how they choose what to learn based on where the market is going, not just curiosity.'),
('psychometric', 'growth_potential', 'senior', 'low', 'Describe learning from challenging assignments.', 'Score 6: Post-mortem logic. Candidate shows they extract the "Universal Principles" from a hard project to use in all future scenarios.'),
('psychometric', 'growth_potential', 'senior', 'low', 'How do you balance execution with skill-building?', 'Score 6: Integrated growth. Candidate describes "learning on the job"—turning everyday puzzles into opportunities to research better methods.'),
('psychometric', 'growth_potential', 'senior', 'low', 'Tell me about developing domain authority.', 'Score 6: Thought leadership. Candidate describes sharing their knowledge (via mentoring, writing, or speaking) to solidify their own expertise.'),
('psychometric', 'growth_potential', 'senior', 'low', 'Describe improving through peer feedback.', 'Score 6: Vulnerability as a tool. Candidate shares a moment a peer pointed out a blind spot and how they "fixed the engine" of their professional behavior.'),
('psychometric', 'growth_potential', 'senior', 'low', 'How do you remain growth-oriented mid-career?', 'Score 6: Combatting stagnation. Candidate describes their plan to avoid the "Comfort Zone" by constantly seeking mentors who are 2 levels above them.'),
('psychometric', 'growth_potential', 'senior', 'low', 'Tell me about broadening your impact.', 'Score 6: Multiplier effect. Candidate describes moving from personal wins to "Team Wins" or "Department Wins" as their primary metric of growth.');

-- ------------------------------------------------------------------------------------------------
-- 5. GROWTH POTENTIAL (MEDIUM - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'senior', 'medium', 'Tell me about transitioning from operational to strategic roles.', 'Score 6: Cognitive shift. Candidate explains the difficulty of letting go of the "details" to focus on the "directions" and how they mastered that transition.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'Describe developing cross-functional leadership skills.', 'Score 6: Matrix influence. Candidate describes learning the "languages" of other departments (Sales, Product, Finance) to lead without formal authority.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'How do you identify future capability gaps?', 'Score 6: Predictive analysis. Candidate identifies a coming trend in their industry and the specific skills they are building *now* to stay relevant in 3 years.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'Tell me about reinventing yourself professionally.', 'Score 6: Identity agility. Candidate describes a major pivot in their career style or focus that required a complete "reset" of their professional habits.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'Describe navigating complexity to enhance competence.', 'Score 6: Complexity mastery. Candidate describes a project so complex it "forced" them to develop a new level of mental organization and leadership.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'How do you foster innovation in your own growth?', 'Score 6: Experimental mindset. Candidate describes trying out new tools or methodologies in a low-stakes environment to see what works before adopting them.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'Tell me about learning during high-pressure phases.', 'Score 6: Under-fire growth. Candidate shows they can acquire a new skill *while* delivery is at its peak, using need as the mother of invention.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'Describe preparing for senior leadership responsibilities.', 'Score 6: Succession preparedness. Candidate describes shadowing leaders or taking on "Acting" roles to test their readiness for the next level.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'How do you ensure continuous adaptability?', 'Score 6: Curiosity habit. Candidate treats "being wrong" as an opportunity to update their internal model, rather than a failure.'),
('psychometric', 'growth_potential', 'senior', 'medium', 'Tell me about aligning growth with long-term organizational vision.', 'Score 6: Enterprise alignment. Candidate shows they grow in ways that make the *company* more valuable, not just their own resume.');

-- ------------------------------------------------------------------------------------------------
-- 6. GROWTH POTENTIAL (HARD - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'senior', 'hard', 'Tell me about redefining your professional identity mid-career.', 'Score 6: Core transformation. Candidate describes moving from "The Specialist" to "The Visionary," and the psychological work required to change their self-image.'),
('psychometric', 'growth_potential', 'senior', 'hard', 'Describe leading transformation while upgrading your own skills.', 'Score 6: Dual-track leadership. A story of overhauling a team/process *while* simultaneously learning the tech or strategy needed to do it.'),
('psychometric', 'growth_potential', 'senior', 'hard', 'How do you future-proof your leadership capabilities?', 'Score 6: Antifragile growth. Candidate builds skills that are valuable *across* industries—like AI integration, emotional intelligence, or complex system design.'),
('psychometric', 'growth_potential', 'senior', 'hard', 'Tell me about navigating growth in uncertain environments.', 'Score 6: Uncertainty logic. Candidate describes growing by *embracing* chaos—taking on the projects nobody else wants because that''s where the learning is.'),
('psychometric', 'growth_potential', 'senior', 'hard', 'Describe building succession-ready competencies.', 'Score 6: Legacy focus. Candidate believes growth isn''t complete until they have trained someone else to do their job better than they can.'),
('psychometric', 'growth_potential', 'senior', 'hard', 'How do you maintain learning agility despite experience?', 'Score 6: Beginner''s mind. Candidate describes how they intentionally "empty the cup" to learn a new trend from a junior colleague or a fresh source.'),
('psychometric', 'growth_potential', 'senior', 'hard', 'Tell me about evolving from specialist to strategic leader.', 'Score 6: Vertical leap. Candidate explains the moment they realized their "technical brilliance" was a bottleneck and shifted to "strategic enablement."'),
('psychometric', 'growth_potential', 'senior', 'hard', 'Describe managing stagnation risk proactively.', 'Score 6: Defensive growth. Candidate describes their "Stagnation Alarm"—the metrics they track to know if they have been in one place too long.'),
('psychometric', 'growth_potential', 'senior', 'hard', 'How do you balance mastery with reinvention?', 'Score 6: Dynamic equilibrium. Candidate describes how they harvest the fruits of their mastery while simultaneously planting the seeds of their next reinvention.'),
('psychometric', 'growth_potential', 'senior', 'hard', 'Tell me about your most significant growth pivot.', 'Score 6: Radical redirection. A story of a "clean break" from a comfortable path into a new, harder, but ultimately higher-ceiling opportunity.');

-- ------------------------------------------------------------------------------------------------
-- 7. SALES DNA (EASY - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'senior', 'low', 'Tell me about managing key accounts successfully.', 'Score 6: Portfolio management. Candidate describes a system for "Account Health" that looks at revenue, advocacy, and future growth opportunities.'),
('psychometric', 'sales_dna', 'senior', 'low', 'Describe mentoring junior sales team members.', 'Score 6: Force multiplier. Candidate shows they can break down their "intuitive" skills into teachable processes for the next generation.'),
('psychometric', 'sales_dna', 'senior', 'low', 'How do you maintain performance consistency over years?', 'Score 6: Discipline over Talent. Candidate attributes their long-term success to a rigid sales daily-discipline rather than "lightning strikes."'),
('psychometric', 'sales_dna', 'senior', 'low', 'Tell me about handling high-value clients.', 'Score 6: High-stakes composure. Candidate treats $1M deals with the same process-rigor as $10k deals, refusing to let the numbers cloud their judgment.'),
('psychometric', 'sales_dna', 'senior', 'low', 'Describe adapting to evolving customer expectations.', 'Score 6: Customer-centric agility. Candidate describes "listening for the change" and updating their value-proposition before the client even realizes they need it.'),
('psychometric', 'sales_dna', 'senior', 'low', 'How do you manage pressure from revenue goals?', 'Score 6: Data-led calm. Candidate manages pressure by looking at their "Sales Funnel Math"—knowing that if they hit the inputs, the output is inevitable.'),
('psychometric', 'sales_dna', 'senior', 'low', 'Tell me about building strategic client partnerships.', 'Score 6: Trusted advisor. Candidate describes being invited into the client''s "inner circle" for planning, showing they are seen as a business partner, not a vendor.'),
('psychometric', 'sales_dna', 'senior', 'low', 'Describe responding to increased competition.', 'Score 6: Differentiation logic. Candidate describes leaning into their "Unique Moat" rather than entering a race-to-the-bottom on price.'),
('psychometric', 'sales_dna', 'senior', 'low', 'How do you maintain motivation after years in sales?', 'Score 6: Mastery motivation. Candidate finds joy in the *craft*—the subtle psychology and complex negotiation—rather than just the commission check.'),
('psychometric', 'sales_dna', 'senior', 'low', 'Tell me about sustaining credibility in your market.', 'Score 6: Reputation management. Candidate describes a long-term approach where they would rather lose a deal than compromise their integrity/reputation.');

-- ------------------------------------------------------------------------------------------------
-- 8. SALES DNA (MEDIUM - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'senior', 'medium', 'Tell me about managing enterprise-level negotiations.', 'Score 6: Complexity orchestration. Candidate describes managing a 6-month negotiation with Legal, Procurement, IT, and Finance, keeping all aligned.'),
('psychometric', 'sales_dna', 'senior', 'medium', 'Describe influencing C-level decision-makers.', 'Score 6: Executive presence. Candidate describes speaking the language of "Risk, Growth, and ROI" to earn the respect of a CEO or CFO.'),
('psychometric', 'sales_dna', 'senior', 'medium', 'How do you align sales strategy with organizational goals?', 'Score 6: Strategic synergy. Candidate shows they don''t just chase revenue, but the *right* revenue that fits the company''s long-term product roadmap.'),
('psychometric', 'sales_dna', 'senior', 'medium', 'Tell me about handling long enterprise sales cycles.', 'Score 6: Momentum maintenance. Candidate describes the "mid-cycle check-ins" and mini-wins used to keep a 12-month deal from stalling.'),
('psychometric', 'sales_dna', 'senior', 'medium', 'Describe leading by example in target-driven environments.', 'Score 6: Cultural leadership. Candidate describes how their work ethic and transparent methodology set the standard for the rest of the sales floor.'),
('psychometric', 'sales_dna', 'senior', 'medium', 'How do you maintain resilience during industry downturns?', 'Score 6: Adaptability. Candidate describes "turning the ship" to target recession-proof industries or pivoting the message to "Efficiency" rather than "Growth."'),
('psychometric', 'sales_dna', 'senior', 'medium', 'Tell me about repositioning value during price objections.', 'Score 6: Value-to-Cost ratio. Candidate flips the price objection by calculating the "Cost of Inaction" for the client—making the price look cheap by comparison.'),
('psychometric', 'sales_dna', 'senior', 'medium', 'Describe balancing relationship depth with revenue accountability.', 'Score 6: Professional boundaries. Candidate shows they can maintain a deep relationship while still being firm on "Closing" and "Contract terms."'),
('psychometric', 'sales_dna', 'senior', 'medium', 'How do you handle complex multi-layered objections?', 'Score 6: Systematic deconstruction. Candidate describes breaking a "No" into its component parts (Technical, Financial, Political) and solving each one individually.'),
('psychometric', 'sales_dna', 'senior', 'medium', 'Tell me about adapting to market disruptions.', 'Score 6: Trend exploitation. Candidate identifies a disruption (like AI or a new regulation) and describes how they used it as a "New Hook" for their sales outreach.');

-- ------------------------------------------------------------------------------------------------
-- 9. SALES DNA (HARD - SENIOR)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'senior', 'hard', 'Tell me about rebuilding revenue after a major market shift.', 'Score 6: Strategic turnaround. A story of a territory that "died" due to market changes and how they rebuilt the pipeline from zero with a new strategy.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'Describe leading large-scale sales transformations.', 'Score 6: Change management. Candidate describes moving a whole team/region from "Order Taking" to "Consultative Selling" and the friction they overcame.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'How do you sustain drive despite long-term pressure?', 'Score 6: Intrinsic fire. Candidate describes a "Why" that is bigger than money—such as building a legacy or truly solving client problems.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'Tell me about influencing strategic partnerships.', 'Score 6: Ecosystem selling. Candidate describes building an alliance with a partner company to create a "2+2=5" offering for a major enterprise.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'Describe managing reputation during revenue setbacks.', 'Score 6: Integrity under fire. Candidate describes a time they missed a target but kept the trust of their clients and leadership through total transparency.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'How do you navigate high-risk, high-reward deals?', 'Score 6: Risk mitigation. Candidate describes the "Safety Nets" they build into a "whale" deal to ensure that even if it fails, the business survives.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'Tell me about creating demand in saturated markets.', 'Score 6: Blue Ocean thinking. Candidate describes finding a "hidden niche" or a "new angle" in a market where everyone already has a solution.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'Describe sustaining elite performance across multiple cycles.', 'Score 6: Mastery endurance. Candidate describes the "Maintenance Mode" of an elite salesperson who stays at the top of the leaderboard for 5+ years straight.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'How do you prevent burnout in high-intensity sales roles?', 'Score 6: Professional sustainability. Candidate share their "Sales Life" philosophy—how they work intensely for 45 mins then check out, protecting their mental energy.'),
('psychometric', 'sales_dna', 'senior', 'hard', 'Tell me about your most challenging strategic win.', 'Score 6: Masterclass in Influence. A story of a "Lost Cause" client where they used 12 months of strategy, patience, and logic to finally close the deal.');
