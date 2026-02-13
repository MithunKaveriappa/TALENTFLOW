-- Unbiased Psychometric Questions Seed Script
-- Experience Band: Fresher (0-1 Years)
-- Drivers: Burnout Risk, Growth Potential, Sales DNA
-- Implementation: Intent-based rubrics for Gemini 1.5 Flash evaluation

-- ------------------------------------------------------------------------------------------------
-- 1. BURNOUT RISK (EASY - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'fresher', 'low', 'Tell me about adjusting to your new role.', 'Score 6: Candidate shows structured adaptation. They identify specific learning methods and show a healthy awareness of their own capacity during the transition.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'Describe handling stress during your first few months.', 'Score 6: Proactive stress management. Candidate describes identifying stressors early and seeking support or using organizational tools to maintain balance.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'How do you manage feeling overwhelmed by new responsibilities?', 'Score 6: Prioritization logic. Candidate describes breaking down large tasks into smaller, manageable steps and asking for clarification rather than panicking.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'Tell me about balancing learning with performance expectations.', 'Score 6: Sustainable growth. Candidate shows they understand that learning is part of performance at this stage and allocates time for both without sacrificing quality.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'Describe a time when workload felt heavy.', 'Score 6: Workload management. Focus on transparency with management and using time-blocking or list-making to navigate the peak period.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'How do you recover after a busy week?', 'Score 6: Self-awareness. Candidate describes specific, healthy recovery habits that allow them to return to work on Monday at 100% capacity.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'Tell me about managing mistakes early in your role.', 'Score 6: Accountability and recovery. They admit the mistake, fix it, and show an absence of toxic self-criticism that leads to burnout.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'Describe maintaining motivation during repetitive tasks.', 'Score 6: Process engagement. Candidate finds value in the "basics" and explains how they stay focused on the larger goal despite the routine nature of the task.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'How do you handle pressure to prove yourself?', 'Score 6: Reality-based confidence. Candidate focuses on incremental wins and building evidence of their value rather than over-extending to the point of exhaustion.'),
('psychometric', 'burnout_risk', 'fresher', 'low', 'Tell me about managing nervousness at work.', 'Score 6: Emotional regulation. Candidate recognizes the feeling as natural and describes using preparation as a tool to channel that energy into performance.');

-- ------------------------------------------------------------------------------------------------
-- 2. BURNOUT RISK (MEDIUM - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'fresher', 'medium', 'Tell me about a time when stress began affecting your focus.', 'Score 6: Early detection. Candidate describes noticing the drop in focus and taking a deliberate "reset" or adjusting their workflow before a failure occurred.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'Describe handling emotional reactions to critical feedback.', 'Score 6: Professional maturity. Candidate shows they can separate their "Identity" from the "Output," processing the feedback logically rather than taking it as a personal attack.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'How do you prevent work stress from affecting personal life?', 'Score 6: Boundary setting. Candidate describes clear psychological or physical transitions they use to "switch off" and protect their long-term mental health.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'Tell me about managing self-doubt under pressure.', 'Score 6: Evidence-led logic. Candidate describes countering self-doubt by looking at their past achievements or seeking objective confirmation from peers/mentors.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'Describe a period when enthusiasm declined.', 'Score 6: Re-alignment. Candidate identifies why the enthusiasm dipped (burnout, lack of challenge) and describes the proactive step taken to find new meaning in the work.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'How do you handle continuous performance expectations?', 'Score 6: Pace management. Candidate shows they understand that performance is a marathon, not a sprint, and describes a sustainable daily rhythm.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'Tell me about recovering from mental exhaustion.', 'Score 6: Strategic recovery. Candidate identifies the root cause of the exhaustion and describes a structural change to their work/rest cycle to prevent recurrence.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'Describe balancing multiple deadlines.', 'Score 6: Triage mastery. Candidate explains the logic used to decide what gets done first and how they communicated realistic timelines to stakeholders.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'How do you stay engaged during high-pressure phases?', 'Score 6: Resilience integration. Focus on "stress-testing" their own systems and finding pride in their ability to maintain quality under load.'),
('psychometric', 'burnout_risk', 'fresher', 'medium', 'Tell me about managing frustration at work.', 'Score 6: Constructive venting. Candidate describes noticing the frustration and choosing a professional path (problem-solving) rather than toxic complaining.');

-- ------------------------------------------------------------------------------------------------
-- 3. BURNOUT RISK (HARD - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'fresher', 'hard', 'Tell me about a time you felt emotionally detached from work.', 'Score 6: Honest reflection and reconnection. Candidate recognizes the detachment as a warning sign and describes the specific re-engagement strategy they used.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'Describe facing persistent stress over an extended period.', 'Score 6: Chronic stress management. Candidate shows how they maintained performance standards without compromising their long-term health through systemic changes.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'How do you handle burnout symptoms early in your career?', 'Score 6: Radical self-honesty. Candidate describes identifying the symptoms and having a "hard conversation" with themselves or management to adjust the trajectory.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'Tell me about avoiding tasks due to overwhelm.', 'Score 6: Ownership of the "Block." Candidate admits the avoidance, identifies the fear/stress behind it, and describes how they pushed through it with a new approach.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'Describe a period when work impacted your well-being.', 'Score 6: Holistic recovery. Candidate describes the trade-offs they had to make to restore their health while still meeting their core professional obligations.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'How do you respond when motivation significantly drops?', 'Score 6: Discipline-over-Motivation. Candidate explains how they rely on their systems and professional standards to maintain output during "low" periods.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'Tell me about questioning your career direction due to pressure.', 'Score 6: Strategic clarity. Candidate shows they used the pressure to clarify what they truly value in a career, leading to a more committed and resilient professional path.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'Describe maintaining performance despite exhaustion.', 'Score 6: Critical efficiency. Candidate describes how they stripped away non-essentials to ensure that the most important work was done at a high standard despite low energy.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'How do you rebuild resilience after sustained stress?', 'Score 6: Post-traumatic growth. Candidate describes what they learned about their "breaking point" and the new boundaries they set to become stronger for the future.'),
('psychometric', 'burnout_risk', 'fresher', 'hard', 'Tell me about your toughest period of emotional strain so far.', 'Score 6: Integration of experience. Candidate shares a vulnerable but professional account of the strain and, most importantly, the logical "way out" they engineered.');

-- ------------------------------------------------------------------------------------------------
-- 4. GROWTH POTENTIAL (EASY - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'fresher', 'low', 'Tell me about learning a new skill in your current role.', 'Score 6: Self-directed learning. Candidate shows they didn''t just wait to be taught, but used resources (videos, docs, peers) to accelerate their mastery.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'Describe how you respond to feedback.', 'Score 6: Immediate application. Candidate shows they greeted feedback with curiosity and immediately tested the new approach to see the result.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'How do you approach tasks that are new to you?', 'Score 6: Structured curiosity. Candidate describes an initial research phase followed by a "safe experiment" or asking specific, high-quality questions.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'Tell me about stepping outside your comfort zone.', 'Score 6: Calculated risk-taking. Candidate describes a moment of discomfort and the specific logic they used to push through it for the sake of learning.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'Describe setting goals for your development.', 'Score 6: SMART orientation. Candidate describes goals that are specific, measurable, and tied to their role''s future needs.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'How do you handle mistakes while learning?', 'Score 6: Iterative mindset. Candidate explains how they documented the mistake to ensure it became a permanent "lesson learned" for them and their team.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'Tell me about improving yourself after receiving guidance.', 'Score 6: Measurable change. Candidate provides a before-and-after example of their performance following a specific piece of guidance.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'Describe staying motivated while building new competencies.', 'Score 6: Progress tracking. Candidate shows they stay motivated by tracking their own incremental progress rather than comparing themselves to senior experts.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'How do you prioritize learning alongside performance?', 'Score 6: Strategic integration. Candidate describes finding ways to learn *through* their tasks, treating every assignment as a training opportunity.'),
('psychometric', 'growth_potential', 'fresher', 'low', 'Tell me about taking initiative early in your role.', 'Score 6: Early value addition. Candidate describes noticing a small gap and filling it without being asked, showing an owner''s mindset from day one.');

-- ------------------------------------------------------------------------------------------------
-- 5. GROWTH POTENTIAL (MEDIUM - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'fresher', 'medium', 'Tell me about actively seeking opportunities to grow beyond assigned tasks.', 'Score 6: Expansion mindset. Candidate describes volunteering for a project specifically because it required a skill they didn''t yet have.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'Describe adapting quickly to a new system or process.', 'Score 6: Learning velocity. Candidate explains how they mapped the new logic to their old knowledge to become a "power user" faster than expected.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'How do you create a plan for personal development?', 'Score 6: Outcome-based planning. Candidate shows they have a structured map for their career, including the specific skills and mentors they need next.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'Tell me about overcoming a steep learning curve.', 'Score 6: Persistence and resources. Candidate describes a time they were out of their depth and the specific "learning sprints" used to catch up.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'Describe applying feedback to produce measurable improvement.', 'Score 6: ROI of feedback. Candidate can point to a specific metric (speed, accuracy, revenue) that improved directly because of a feedback-based change.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'How do you handle setbacks during skill-building?', 'Score 6: Analysis-led recovery. Candidate treats a skill-building plateau as a data signal to change their learning method rather than a reason to quit.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'Tell me about balancing short-term performance with long-term growth.', 'Score 6: Strategic time-management. Candidate makes the "hard call" to spend time on a long-term skill that will pay off later, while maintaining today''s output.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'Describe learning something complex under time pressure.', 'Score 6: High-pressure cognition. Candidate explains how they identified the "80/20" of the new complex topic to become functional and useful immediately.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'How do you track your own progress?', 'Score 6: Self-audit. Candidate describes a system (log, dashboard, peer-check) they use to verify they are actually getting better every month.'),
('psychometric', 'growth_potential', 'fresher', 'medium', 'Tell me about taking ownership of your learning journey.', 'Score 6: Radical autonomy. Candidate shows they don''t wait for "Company Training"—they find the books, courses, and experts required to move forward.');

-- ------------------------------------------------------------------------------------------------
-- 6. GROWTH POTENTIAL (HARD - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'fresher', 'hard', 'Tell me about deliberately pursuing growth beyond role expectations.', 'Score 6: Future-role orientation. Candidate describes mastering skills for the *next* level while still excelling at their current level.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'Describe identifying and addressing your own developmental gaps.', 'Score 6: Intellectual honesty. Candidate identifies a "weakness" they noticed before anyone else did and describes the 3-month plan they used to turn it into a strength.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'How do you prepare for future responsibilities not yet assigned?', 'Score 6: Anticipatory learning. Candidate describes researching industry trends and building competencies that the *company* will need in 12 months.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'Tell me about converting failure into structured learning.', 'Score 6: Alchemy of failure. Candidate takes a major professional "dark moment" and explains the specific, high-level business lesson they extracted from it.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'Describe building long-term career competencies early on.', 'Score 6: Foundational focus. Candidate shows they are prioritizing "High-Value" skills (leadership, logic, negotiation) over simple tactical "how-to" knowledge.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'How do you sustain growth when progress feels slow?', 'Score 6: Grit-led growth. Candidate explains their philosophy of "incremental gains" and how they maintain momentum during the "boring" phases of mastery.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'Tell me about proactively seeking uncomfortable feedback.', 'Score 6: Ego-less growth. Candidate admits to asking a critic "What am I doing that most holds me back?" and describes the radical change they made as a result.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'Describe aligning personal growth with organizational direction.', 'Score 6: Strategic synergy. Candidate explains how their personal learning path is intentionally designed to solve specific company problems.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'How do you future-proof your skills?', 'Score 6: Meta-learning. Candidate describes how they "learn how to learn" so they can adapt regardless of how the industry or technology shifts.'),
('psychometric', 'growth_potential', 'fresher', 'hard', 'Tell me about demonstrating resilience during intense learning phases.', 'Score 6: Sustained intensity. Candidate describes a multi-month period of high-difficulty learning and how they maintained their well-being and performance throughout.');

-- ------------------------------------------------------------------------------------------------
-- 7. SALES DNA (EASY - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'fresher', 'low', 'Tell me about persuading someone to accept your idea.', 'Score 6: Benefit-led persuasion. Candidate shows they focused on *why* it helped the other person, rather than just why they wanted it.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'Describe approaching a new person to build rapport.', 'Score 6: Relationship curiosity. Candidate describes using open-ended questions and active listening to find common ground quickly.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'How do you handle rejection?', 'Score 6: Impersonal resilience. Candidate views rejection as a "No for now" or an "incorrect fit" rather than a personal failure.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'Tell me about achieving a target or goal.', 'Score 6: Goal obsession. Candidate describes the plan they made to hit the target and the extra effort they put in when they were behind.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'Describe staying motivated during repetitive outreach.', 'Score 6: Activity logic. Candidate understands that "Sales is a numbers game" and finds motivation in the activity metrics themselves.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'How do you prepare before presenting an idea?', 'Score 6: Audience research. Candidate describes anticipating objections and tailoring their message to the specific needs of the listener.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'Tell me about convincing someone who was hesitant.', 'Score 6: Empathy and evidence. Candidate shows they listened to the hesitation and provided the one specific data point or reassurance that resolved it.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'Describe maintaining confidence during discussions.', 'Score 6: Knowledge-based authority. Candidate shows that their confidence comes from being prepared and truly believing in the value of their proposal.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'How do you respond when someone challenges your proposal?', 'Score 6: Collaborative defense. Candidate treats the challenge as an opportunity to clarify the value, rather than a fight to be won.'),
('psychometric', 'sales_dna', 'fresher', 'low', 'Tell me about following up to secure commitment.', 'Score 6: Systematic persistence. Candidate describes the specific follow-up sequence they used to ensure the idea didn''t die due to inaction.');

-- ------------------------------------------------------------------------------------------------
-- 8. SALES DNA (MEDIUM - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'fresher', 'medium', 'Tell me about handling objections during a discussion.', 'Score 6: Consultative handling. Candidate describes the "Listen > Empathize > Propose" loop to handle objections without being pushy.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'Describe staying persistent after multiple rejections.', 'Score 6: Optimistic stamina. Candidate shows they maintained the same "High Energy" for the 10th person as they did for the 1st person.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'How do you adapt your communication style for different personalities?', 'Score 6: Social agility. Candidate describes reading cues (Analytical, Expressive, etc.) and adjusting their pace and tone to match.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'Tell me about taking ownership when a result was not achieved.', 'Score 6: Radical accountability. Candidate doesn''t blame "The Market" or "The Leads"—they look at their own activity and pitch to find the fix.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'Describe influencing a decision without formal authority.', 'Score 6: Logical influence. Candidate describes building an "Alliance of Value" to convince others that the decision was in their own best interest.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'How do you maintain energy during high-target periods?', 'Score 6: Strategic enthusiasm. Candidate describes creating a "Winning Environment" for themselves to stay focused and productive under load.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'Tell me about identifying an opportunity others overlooked.', 'Score 6: Consultative discovery. Candidate describes hearing a "hidden need" in a casual conversation and turning it into a formal proposal.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'Describe managing performance pressure.', 'Score 6: Activity-to-Outcome focus. Candidate manages the pressure by doubling down on the *actions* they control rather than worrying about the outcome they don''t.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'How do you build trust quickly with new contacts?', 'Score 6: Integrity-led rapport. Candidate shows they prioritize honesty and "doing what they say" from the very first minute of the relationship.'),
('psychometric', 'sales_dna', 'fresher', 'medium', 'Tell me about learning from a lost opportunity.', 'Score 6: Loss analysis. Candidate describes a specific behavior they changed in their *next* pitch because of the one they just lost.');

-- ------------------------------------------------------------------------------------------------
-- 9. SALES DNA (HARD - FRESHER)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'fresher', 'hard', 'Tell me about thriving in a highly competitive environment.', 'Score 6: Competitive resilience. Candidate finds energy in the competition and uses it to drive their own standards higher without becoming toxic.'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'Describe turning a firm “no” into a potential opportunity.', 'Score 6: Strategic inquiry. Candidate shows how they qualified the "No" to understand the constraint, leading to a modified proposal that was a "Yes."'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'How do you strategically influence both logic and emotion?', 'Score 6: Holistic persuasion. Candidate describes using "Social Proof" for emotion and "CBA/ROI" for logic to close the gap.'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'Tell me about negotiating while protecting value.', 'Score 6: Value-first negotiation. Candidate shows they were willing to trade "terms" for "price," ensuring the company''s margin was protected.'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'Describe maintaining high performance during consecutive setbacks.', 'Score 6: Resilience cycle. Candidate explains how they "reset" after each loss to ensure the next prospect received their best possible performance.'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'How do you sustain momentum during long sales cycles?', 'Score 6: Multi-threading influence. Candidate describes engaging multiple people in an organization to ensure the "deal" stays alive even if one person goes silent.'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'Tell me about recovering confidence after a major rejection.', 'Score 6: Self-rebuilding. Candidate described an objective post-mortem that proved the loss wasn''t a failure of their talent, but a specific process gap they have now fixed.'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'Describe balancing relationship-building with revenue focus.', 'Score 6: Commercial empathy. Candidate shows they can have a "warm" relationship while still being firm on the revenue requirements of the deal.'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'How do you ensure consistent follow-through until closure?', 'Score 6: CRM discipline. Candidate explains their methodical "Tickler" system and why they never let a lead go cold due to purely administrative reasons.'),
('psychometric', 'sales_dna', 'fresher', 'hard', 'Tell me about your toughest closing experience.', 'Score 6: Closing persistence. A story of high-stakes deadlock and the specific "Value Bridge" they built to finally secure the commitment.');
