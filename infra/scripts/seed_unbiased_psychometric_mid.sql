-- Unbiased Psychometric Questions Seed Script
-- Experience Band: Mid (1-5 Years)
-- Drivers: Burnout Risk, Growth Potential, Sales DNA
-- Implementation: Intent-based rubrics for Gemini 1.5 Flash evaluation

-- ------------------------------------------------------------------------------------------------
-- 1. BURNOUT RISK (EASY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'mid', 'low', 'Reflect on times you feel consistently tired after workdays. How do you manage your energy?', 'Score 6: Candidate shows self-awareness. They identify energy drains and describe a proactive system for physical or mental replenishment.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'How do you handle a workload that feels heavier than in your early career years?', 'Score 6: Operational maturity. Candidate describes using improved efficiency, delegation, or tool-usage to handle the increased load rather than just working longer hours.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'Describe your approach to maintaining work-life balance as your responsibilities grow.', 'Score 6: Boundary logic. Candidate explains high-level prioritization and the use of rituals or schedules to protect personal time.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'How do you process the ongoing pressure to perform at a high level?', 'Score 6: Professional perspective. Candidate describes viewing pressure as a manageable component of the role rather than a personal crisis.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'Tell me about managing stress during peak business periods.', 'Score 6: Peak-load management. Candidate describes a specific "Survival Mode" protocol that maintains performance while preventing long-term exhaustion.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'How do you successfully disconnect from work responsibilities after hours?', 'Score 6: Cognitive switching. Candidate shares a technique for "mentally punching out" to ensure deep rest.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'How do you stay energized when handling day-to-day routine responsibilities?', 'Score 6: Process engagement. Candidate identifies the "Higher Why" in routine tasks to maintain focus and prevent boredom-induced fatigue.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'Describe how you maintain steady motivation despite fluctuations in workload.', 'Score 6: Internal locus of control. Candidate describes relying on their own standards of excellence rather than external excitement.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'How do you ensure you have enough time for personal recovery?', 'Score 6: Strategic rest. Candidate treats recovery as a non-negotiable part of their high-performance system.'),
('psychometric', 'burnout_risk', 'mid', 'low', 'Reflect on times when fatigue impacts your enthusiasm. What is your response?', 'Score 6: Resilience cycle. Candidate describes identifying early signs of fatigue and taking a "micro-break" or adjusting their pace to recover early.');

-- ------------------------------------------------------------------------------------------------
-- 2. BURNOUT RISK (MEDIUM - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'mid', 'medium', 'How do you manage the mental strain of sustained performance expectations?', 'Score 6: Sustainable pace. Candidate describes breaking the year into "sprints" and "recovery zones" to maintain a high average output.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'Tell me about managing emotional exhaustion during consecutive busy days.', 'Score 6: EQ and composure. Candidate shows they can monitor their own emotional temperature and use logic to stay professional under strain.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'How do you handle moments when increased responsibilities feel overwhelming?', 'Score 6: Resourcefulness. Candidate describes "Triaging" the responsibilities and communicating with leadership to align on realistic priorities.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'How do you maintain your drive when recognition does not match your effort invested?', 'Score 6: Intrinsic motivation. Candidate finds satisfaction in the work quality and the skill-building itself, rather than relying solely on external praise.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'How do you maintain your patience in high-pressure situations?', 'Score 6: Sophisticated composure. Candidate describes a "mental pause" technique that allows them to choose a logical response over an emotional reaction.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'Tell me about maintaining productivity when work stress is high.', 'Score 6: Signal-vs-Noise. Candidate describes focusing on "high-leverage" tasks and using rigid systems to stay productive despite the background stress.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'How do you manage professional commitments that interfere with personal priorities?', 'Score 6: Conflict resolution. Candidate describes a fair and transparent negotiation with stakeholders to find a win-win that respects both spheres.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'How do you prevent mental fatigue from reducing your problem-solving ability?', 'Score 6: Cognitive conservation. Candidate describes taking "brain breaks" or switching to less intensive tasks to allow their creative logic to recover.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'Describe staying motivated when your work outcomes feel repetitive.', 'Score 6: Continuous improvement. Candidate challenges themselves to "beat their own record" or find a new innovation in the repetitive task.'),
('psychometric', 'burnout_risk', 'mid', 'medium', 'Tell me about managing multiple competing priorities without burning out.', 'Score 6: Multi-project management. Candidate describes a visual or logical system for managing the mental load of several high-stakes projects.');

-- ------------------------------------------------------------------------------------------------
-- 3. BURNOUT RISK (HARD - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'burnout_risk', 'mid', 'hard', 'How do you prevent chronic stress from impacting your engagement with work?', 'Score 6: Engaged resilience. Candidate describes a system for monitoring their "engagement levels" and taking strategic action to re-align with the mission.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'Reflect on how your emotional resilience has evolved since you started your career.', 'Score 6: Growth reflection. Candidate identifies specific "resilience skills" (e.g., detachment, prioritization) they have learned to deploy under heavy stress.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'How do you address burnout symptoms while still maintaining your performance?', 'Score 6: Radical ownership. Candidate describes early intervention—adjusting their workflow or workload *before* performance drops significantly.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'Tell me about managing work demands that create long-term exhaustion.', 'Score 6: Structural change. Candidate describes a moment they realized a working style was unsustainable and the systemic change they made to fix it.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'How do you handle feeling trapped between high expectations and limited resources?', 'Score 6: Frugal innovation. Candidate describes the logic of "doing less to achieve more" by focusing purely on ROI-positive activities.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'Describe how you maintain professional growth despite constant pressure.', 'Score 6: Growth endurance. Candidate shows they continue to upskill *even when busy*, viewing growth as the solution to the pressure.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'How do you protect your personal relationships from the impact of work stress?', 'Score 6: Holistic health. Candidate describes have a "hard wall" between work behavior and personal interactions to ensure high-quality rest.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'How do you ensure fatigue doesn’t influence the quality of your decision-making?', 'Score 6: Process guardrails. Candidate describes using checklists, peer-reviews, or a "wait-24-hours" rule for decision-making when tired.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'How do you rebuild a sense of accomplishment during periods of heavy effort?', 'Score 6: Achievement mapping. Candidate describes tracking their own wins and the impact they have, even when the final goal is still far off.'),
('psychometric', 'burnout_risk', 'mid', 'hard', 'How do you evaluate if a workload intensity is sustainable in the long term?', 'Score 6: Future-oriented logic. Candidate describes the specific health and performance metrics they use to "check the engine" of their own career.');

-- ------------------------------------------------------------------------------------------------
-- 4. GROWTH POTENTIAL (EASY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'mid', 'low', 'Tell me about expanding your role responsibilities.', 'Score 6: Proactive expansion. Candidate describes taking on a task specifically because it aligned with a desired future skill.'),
('psychometric', 'growth_potential', 'mid', 'low', 'Describe learning a new capability to improve performance.', 'Score 6: Learning ROI. Candidate identifies a bottleneck in their work and the specific skill they learned to clear it.'),
('psychometric', 'growth_potential', 'mid', 'low', 'How do you respond to evolving job expectations?', 'Score 6: Agility. Candidate describes greeting new expectations with curiosity rather than resistance, and a plan to master the new requirements.'),
('psychometric', 'growth_potential', 'mid', 'low', 'Tell me about volunteering for new challenges.', 'Score 6: Fearless learning. Candidate describes a time they "raised their hand" for a task they weren''t 100% ready for, in order to grow.'),
('psychometric', 'growth_potential', 'mid', 'low', 'Describe improving performance through self-initiative.', 'Score 6: Owner mindset. Candidate describes a improvement they made to a process or result that wasn''t part of their formal job description.'),
('psychometric', 'growth_potential', 'mid', 'low', 'How do you maintain curiosity in your role?', 'Score 6: Intellectural engagement. Candidate describes specific habits (reading, networking, questioning) they use to stay "mentally fresh."'),
('psychometric', 'growth_potential', 'mid', 'low', 'Tell me about taking feedback constructively.', 'Score 6: Rapid application. Candidate describes a specific piece of feedback and the measurable performance gain that resulted from implementing it.'),
('psychometric', 'growth_potential', 'mid', 'low', 'Describe developing expertise in your domain.', 'Score 6: Depth orientation. Candidate shows they aren''t just learning the "what" but the "why" and "how" of their industry.'),
('psychometric', 'growth_potential', 'mid', 'low', 'How do you stay motivated to grow professionally?', 'Score 6: Vision alignment. Candidate describes how their current growth is a specific stepping stone to their 5-year career goal.'),
('psychometric', 'growth_potential', 'mid', 'low', 'Tell me about setting mid-term career goals.', 'Score 6: Strategic planning. Candidate describes a goal for the next 2-3 years and the specific milestones they are currently hitting.');

-- ------------------------------------------------------------------------------------------------
-- 5. GROWTH POTENTIAL (MEDIUM - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'mid', 'medium', 'Tell me about adapting to significant changes in your role.', 'Score 6: Transition agility. Candidate describes the "unlearning and relearning" process they went through to stay effective during a role shift.'),
('psychometric', 'growth_potential', 'mid', 'medium', 'Describe upskilling to remain relevant in your field.', 'Score 6: Future-proofing. Candidate identifies a technology or market shift and the specific training/course they completed to prepare.'),
('psychometric', 'growth_potential', 'mid', 'medium', 'How do you evaluate your strengths and improvement areas?', 'Score 6: Analytical self-awareness. Candidate describes using data, peer feedback, or self-audits to find their "skills gaps."'),
('psychometric', 'growth_potential', 'mid', 'medium', 'Tell me about leading a task outside your comfort zone.', 'Score 6: Courageous leadership. Candidate describes handling the uncertainty and using their core logic to drive a result in unfamiliar territory.'),
('psychometric', 'growth_potential', 'mid', 'medium', 'Describe pursuing certifications or structured learning.', 'Score 6: Discipline. Candidate shows they can commit to a long-term learning path outside of normal working hours.'),
('psychometric', 'growth_potential', 'mid', 'medium', 'How do you handle plateaus in your development?', 'Score 6: Persistence. Candidate describes a time they felt "stuck" and the specific change in method or mentorship they sought to break through.'),
('psychometric', 'growth_potential', 'mid', 'medium', 'Tell me about expanding your influence beyond your formal role.', 'Score 6: Matrix impact. Candidate describes how they helped another department or colleague, building social capital and knowledge.'),
('psychometric', 'growth_potential', 'mid', 'medium', 'Describe building competencies for leadership readiness.', 'Score 6: Anticipatory lead. Candidate describes learning how to coach others or manage projects before they were given a formal leadership title.'),
('psychometric', 'growth_potential', 'mid', 'medium', 'How do you align growth efforts with career aspirations?', 'Score 6: Goal synergy. Candidate explains how every new skill they learn is a deliberate addition to their "Career Stack."'),
('psychometric', 'growth_potential', 'mid', 'medium', 'Tell me about learning from cross-functional exposure.', 'Score 6: Holistic business logic. Candidate describes what they learned about "The Big Picture" by working with a completely different department.'),

-- ------------------------------------------------------------------------------------------------
-- 6. GROWTH POTENTIAL (HARD - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'growth_potential', 'mid', 'hard', 'Tell me about redefining your career direction intentionally.', 'Score 6: Strategic pivot. Candidate describes a moment they realized they were on the "wrong path" and the logical steps they took to re-steer toward a higher-potential future.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'Describe developing strategic thinking capabilities.', 'Score 6: Cognitive expansion. Candidate describes moving from "Doing" to "Planning"—understanding the market and competitive landscape in a new way.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'How do you prepare for roles beyond your current level?', 'Score 6: Gap analysis. Candidate describes the specific leadership or technical skills they are building *now* to be ready for a promotion in 12 months.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'Tell me about mentoring others while growing yourself.', 'Score 6: Multiplier mindset. Candidate shows they can teach what they are still learning, cementing their own knowledge while helping the team.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'Describe transforming weaknesses into strengths.', 'Score 6: Radical transformation. A story of a "natural weakness" that they fixed through intense, systematic effort and discipline.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'How do you sustain adaptability in dynamic environments?', 'Score 6: Environment sensing. Candidate describes their personal system for "monitoring change" and adjusting their skills every quarter.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'Tell me about navigating growth during organizational shifts.', 'Score 6: Chaos agility. Candidate shows how they turned a re-org or acquisition into an opportunity to learn a new part of the business.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'Describe building long-term value rather than short-term gains.', 'Score 6: Integrity focus. Candidate describes a time they sacrificed an easy win for a longer-term structural improvement in their skills or the company.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'How do you maintain relevance in competitive environments?', 'Score 6: Competitive learning. Candidate treats the high standards of their peers as a benchmark to push their own growth further.'),
('psychometric', 'growth_potential', 'mid', 'hard', 'Tell me about your toughest growth acceleration phase.', 'Score 6: High-intensity learning. A story of massive, rapid skill acquisition under pressure and how they managed the stress of the "learning curve."');

-- ------------------------------------------------------------------------------------------------
-- 7. SALES DNA (EASY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'mid', 'low', 'Tell me about consistently achieving sales targets.', 'Score 6: Systematic delivery. Candidate explains their "Math of Sales"—how many leads/calls they need to guarantee the outcome every single time.'),
('psychometric', 'sales_dna', 'mid', 'low', 'Describe building long-term client relationships.', 'Score 6: Advisor mindset. Candidate describes moving from "Salesperson" to "Trusted Partner," focusing on the client''s business results over years.'),
('psychometric', 'sales_dna', 'mid', 'low', 'How do you handle initial resistance from prospects?', 'Score 6: Curiosity over defense. Candidate describes using discovery questions to find the logic behind the resistance rather than pushing back.'),
('psychometric', 'sales_dna', 'mid', 'low', 'Tell me about staying disciplined in follow-ups.', 'Score 6: CRM mastery. Candidate explains their methodology for ensures no opportunity "falls through the cracks" during a 6-month cycle.'),
('psychometric', 'sales_dna', 'mid', 'low', 'Describe managing a competitive sales environment.', 'Score 6: Healthy competition. Candidate thrives in the pressure of the leaderboard and uses it to sharpen their own tactical standards.'),
('psychometric', 'sales_dna', 'mid', 'low', 'How do you prepare before important client interactions?', 'Score 6: Strategic intelligence. Candidate describes researching the client''s industry, competitors, and annual reports before the call.'),
('psychometric', 'sales_dna', 'mid', 'low', 'Tell me about maintaining motivation during slow quarters.', 'Score 6: Pipeline hygiene. Candidate describes using slow periods to "clean the deck" and build a massive base for the next quarter.'),
('psychometric', 'sales_dna', 'mid', 'low', 'Describe handling performance reviews tied to revenue.', 'Score 6: Data ownership. Candidate treats the review as a technical discussion of "Inputs vs Outputs" and creates a concrete plan for improvement.'),
('psychometric', 'sales_dna', 'mid', 'low', 'How do you manage stress during high-pressure sales cycles?', 'Score 6: Composure. Candidate shows they can maintain a "helpful tonality" with clients even when they are behind on their quota.'),
('psychometric', 'sales_dna', 'mid', 'low', 'Tell me about building credibility with clients.', 'Score 6: Evidence-based selling. Candidate describes using case-studies, logic, and deep product knowledge to overcome skepticism.');

-- ------------------------------------------------------------------------------------------------
-- 8. SALES DNA (MEDIUM - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'mid', 'medium', 'Tell me about handling complex objections.', 'Score 6: Sophisticated redirection. Candidate identifies the "unspoken objection" and addresses the business impact of *not* solving the problem.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'Describe negotiating win-win agreements.', 'Score 6: Value expansion. Candidate explains how they traded low-cost items (e.g., training) for high-value items (e.g., contract length) to protect margin.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'How do you manage pipeline uncertainty?', 'Score 6: Probability logic. Candidate shows they run their pipeline based on "weighted value" and always have a "Plan B" segment of leads.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'Tell me about influencing multi-stakeholder decisions.', 'Score 6: Stakeholder mapping. Candidate describes finding the "Technical Buyer" vs "Financial Buyer" and tailoring the message to both.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'Describe recovering from a missed quarterly target.', 'Score 6: Resilience and redirection. Candidate describes a logical post-mortem of the miss and the immediate activity surge used to bridge the gap next time.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'How do you prioritize high-value opportunities?', 'Score 6: ROI focus. Candidate describes their "Ideal Customer Profile" and why they walk away from small, low-margin deals to focus on big wins.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'Tell me about adapting strategy mid-cycle.', 'Score 6: Tactical agility. Candidate describes noticing a change in the market and pivoting their talk-track or offer to stay competitive.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'Describe maintaining resilience in volatile markets.', 'Score 6: Emotional stability. Candidate shows they don''t panic during market dips but focus on where the "pockets of value" still exist.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'How do you differentiate yourself from competitors?', 'Score 6: Value-prop mastery. Candidate describes selling the "Unique Outcome" the client gets, making price a secondary consideration.'),
('psychometric', 'sales_dna', 'mid', 'medium', 'Tell me about managing long and uncertain deal cycles.', 'Score 6: Endurance influence. Candidate describes "Multi-threading"—building relationships with 3+ people in the client company to ensure the deal survives.'),

-- ------------------------------------------------------------------------------------------------
-- 9. SALES DNA (HARD - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('psychometric', 'sales_dna', 'mid', 'hard', 'Tell me about turning around a declining territory or segment.', 'Score 6: Territory leadership. Candidate explains the systemic fixes (messaging, outreach, activity) they used to bring a failing segment back to growth.'),
('psychometric', 'sales_dna', 'mid', 'hard', 'Describe managing sustained rejection without performance drop.', 'Score 6: Professional detachment. Candidate describes viewing each "No" as one step closer to a "Yes," maintaining the exact same energy for months.'),
('psychometric', 'sales_dna', 'mid', 'hard', 'How do you sustain confidence under extreme performance pressure?', 'Score 6: Logic-over-Fear. Candidate manages their own state by focusing on their verified "activity ratios" rather than the mounting pressure.'),
('psychometric', 'sales_dna', 'mid', 'hard', 'Tell me about leading high-stakes negotiations.', 'Score 6: Master negotiator. Candidate describes the "walk-away point," the trade-offs, and the specific moment they moved the client from "interest" to "commitment."'),
('psychometric', 'sales_dna', 'mid', 'hard', 'Describe navigating aggressive competitive environments.', 'Score 6: Competitive IQ. Candidate shows how they used a competitor''s aggressive price-cutting as a reason to highlight their own superior "total cost of ownership."'),
('psychometric', 'sales_dna', 'mid', 'hard', 'How do you maintain emotional control in tense negotiations?', 'Score 6: Tactical silence. Candidate describes using silence and de-escalation language to regain control of a room during a conflict.'),
('psychometric', 'sales_dna', 'mid', 'hard', 'Tell me about strategically upselling or cross-selling.', 'Score 6: Relationship expansion. Candidate describes finding a new pain point in an *existing* happy client and building a new case for more revenue.'),
('psychometric', 'sales_dna', 'mid', 'hard', 'Describe balancing short-term wins with long-term account value.', 'Score 6: Strategic integrity. Candidate shows they would rather lose a small deal today than compromise the client''s trust for a major deal next year.'),
('psychometric', 'sales_dna', 'mid', 'hard', 'How do you maintain accountability for pipeline gaps?', 'Score 6: Ownership. Candidate admits when they took their "foot off the gas" and describes the massive volume of activity they initiated to fix the gap.'),
('psychometric', 'sales_dna', 'mid', 'hard', 'Tell me about your toughest revenue turnaround.', 'Score 6: Grit-led success. A story of a "lost cause" client or territory that they rebuilt through pure persistence and a total strategy redesign.');
