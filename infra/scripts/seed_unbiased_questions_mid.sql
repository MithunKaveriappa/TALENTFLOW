-- Unbiased Behavioral Questions Seed Script
-- Experience Band: Mid (1-5 Years)
-- Drivers: Resilience, Communication, Adaptability
-- Implementation: Intent-based rubrics for Gemini 1.5 Flash evaluation

-- ------------------------------------------------------------------------------------------------
-- 1. RESILIENCE (LOW DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'resilience', 'mid', 'low', 'Tell me about a time you missed a target. What did you do next?', 'Score 6: Candidate takes immediate ownership without blaming external factors. They detail an analytical post-mortem and the corrective actions taken to prevent a recurrence.'),
('behavioral', 'resilience', 'mid', 'low', 'How do you handle rejection from clients or stakeholders?', 'Score 6: Candidate views rejection as an information-gathering exercise. They describe a specific method for uncovering the "Why" and staying professionally engaged for future opportunities.'),
('behavioral', 'resilience', 'mid', 'low', 'Describe a time when your effort did not immediately produce results.', 'Score 6: Focus on "Deep Work" and patience. Candidate explains their system for tracking progress through secondary metrics (lagging vs leading indicators).'),
('behavioral', 'resilience', 'mid', 'low', 'Tell me about a challenging week at work and how you handled it.', 'Score 6: Stress management and prioritization. Candidate describes how they segmented high-value tasks and maintained personal wellbeing to sustain performance.'),
('behavioral', 'resilience', 'mid', 'low', 'How do you stay motivated during slow business periods?', 'Score 6: Proactive self-starting. Candidate mentions specific productive activities (upskilling, pipeline cleanup, internal projects) used during downtime point.'),
('behavioral', 'resilience', 'mid', 'low', 'Describe a time when you faced negative feedback from a manager.', 'Score 6: Professional maturity. Candidate demonstrates the ability to separate ego from the goal, asking clarifying questions and documenting an improvement plan.'),
('behavioral', 'resilience', 'mid', 'low', 'What do you do when a client says “no”?', 'Score 6: Strategic persistence. Candidate describes qualifying the "No"—is it permanent or temporary? They show a method for keeping the relationship warm.'),
('behavioral', 'resilience', 'mid', 'low', 'Tell me about a time when you had to restart a task due to errors.', 'Score 6: Accountability and speed. Candidate explains the error, acknowledges the lost time, and details a more efficient "v2" process to catch up.'),
('behavioral', 'resilience', 'mid', 'low', 'How do you manage stress during peak workload?', 'Score 6: Systematic organization. Candidate mentions tools/methods (Time-blocking, Eisenhower matrix) used to maintain logic under pressure.'),
('behavioral', 'resilience', 'mid', 'low', 'Describe a situation where persistence helped you succeed.', 'Score 6: Goal orientation. Focus on the long-arc effort and the specific moment they could have quit but chose a new creative angle instead.');

-- ------------------------------------------------------------------------------------------------
-- 2. RESILIENCE (MEDIUM DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'resilience', 'mid', 'medium', 'Tell me about a deal or project that failed despite your effort.', 'Score 6: High-level reflection. Candidate identifies the "uncontrollables" while still finding one personal behavior they would change for next time.'),
('behavioral', 'resilience', 'mid', 'medium', 'Describe a time when repeated objections tested your patience.', 'Score 6: Composure. Candidate shows they maintained professional standards and used curiosity to understand the root of the objections rather than getting defensive.'),
('behavioral', 'resilience', 'mid', 'medium', 'How do you recover after losing an important opportunity?', 'Score 6: Resilience cycle. Candidate describes a brief "cool-down" followed by an objective analysis of the loss and immediate focus on the next target.'),
('behavioral', 'resilience', 'mid', 'medium', 'Tell me about a time when you had to maintain performance despite personal challenges.', 'Score 6: Resilience integration. Focus on the ability to compartmentalize effectively while maintaining honest communication with the team if necessary.'),
('behavioral', 'resilience', 'mid', 'medium', 'Describe a time when you faced unfair criticism at work.', 'Score 6: Conflict management. Candidate shows they addressed the unfairness through evidence-based discussion or high performance, rather than toxic behavior.'),
('behavioral', 'resilience', 'mid', 'medium', 'How do you prevent burnout during demanding periods?', 'Score 6: Self-awareness. Candidate defines their early warning signs of stress and the specific boundaries or recovery habits they use to stay at 100%.'),
('behavioral', 'resilience', 'mid', 'medium', 'Tell me about a time when your confidence was impacted professionally.', 'Score 6: Self-reconstruction. Candidate describes the specific "win" or mentorship they sought to rebuild their professional self-esteem.'),
('behavioral', 'resilience', 'mid', 'medium', 'Describe a situation where you had to manage disappointment within your team.', 'Score 6: Leadership potential. Candidate shows they acknowledged the team''s feelings but pivoted the group rapidly toward a shared future goal.'),
('behavioral', 'resilience', 'mid', 'medium', 'How do you balance persistence without becoming pushy?', 'Score 6: Sales EQ. Candidate describes the difference between "repetition" and "adding value" at each point of follow-up.'),
('behavioral', 'resilience', 'mid', 'medium', 'Tell me about a time when resilience directly impacted business results.', 'Score 6: ROI focus. A clear story where refusing to give up on a "lost cause" (with a logical reason) led to a measurable financial or project success.');

-- ------------------------------------------------------------------------------------------------
-- 3. RESILIENCE (HIGH DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'resilience', 'mid', 'high', 'Tell me about a prolonged period of underperformance. What changed?', 'Score 6: Transformative ownership. Candidate recognizes a flawed pattern in their own work and describes a structural change in their methodology to fix it.'),
('behavioral', 'resilience', 'mid', 'high', 'Describe a time when external factors (market, policy, competition) affected your results.', 'Score 6: Strategic Pivot. Candidate shows they didn''t just survive the external change, but adapted their offering/strategy to find a new advantage within the new reality.'),
('behavioral', 'resilience', 'mid', 'high', 'When do you decide to walk away from an opportunity instead of persisting?', 'Score 6: Strategic judgment. Focus on the analytical framework (Opportunity Cost, ROI, Ideal Customer Profile) used to make the "hard call" to quit.'),
('behavioral', 'resilience', 'mid', 'high', 'Tell me about a time when you had to motivate others despite setbacks.', 'Score 6: Infectious resilience. Candidate demonstrates how they projected confidence and provided a roadmap that suppressed the team''s collective fear.'),
('behavioral', 'resilience', 'mid', 'high', 'Describe a situation where resilience required emotional control rather than action.', 'Score 6: Sophisticated composure. Focus on the "waiting game"—staying firm and not overreacting during a volatile or high-stakes period of inaction.'),
('behavioral', 'resilience', 'mid', 'high', 'How do you handle losing to a strong competitor repeatedly?', 'Score 6: Competitive intelligence. Candidate uses the losses to map the competitor''s strengths and identifies a specific "Blue Ocean" or niche to win back market share.'),
('behavioral', 'resilience', 'mid', 'high', 'Tell me about a high-pressure situation where staying calm changed the outcome.', 'Score 6: Critical impact. Describes a specific incident (negotiation, crisis) where their refusal to panic allowed for a logical solution others missed.'),
('behavioral', 'resilience', 'mid', 'high', 'Describe how you rebuild trust after a mistake.', 'Score 6: Trust repair. Focus on immediate disclosure, fixing the error at personal cost, and consistent follow-through over the subsequent months.'),
('behavioral', 'resilience', 'mid', 'high', 'Tell me about a time when you faced resistance from multiple stakeholders.', 'Score 6: Stakeholder management. Candidate shows they identified individual motivations and used "resilient diplomacy" to find a common path forward.'),
('behavioral', 'resilience', 'mid', 'high', 'What have failures taught you about your working style over the years?', 'Score 6: Meta-learning. Deeply reflective answer showing how they have evolved from a "effort-only" mindset to a "result-and-process" mindset.');

-- ------------------------------------------------------------------------------------------------
-- 4. COMMUNICATION (LOW DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'communication', 'mid', 'low', 'Tell me about a time you explained a product or idea to a client.', 'Score 6: Feature-to-Benefit transformation. Candidate shows they didn''t just list specs but explained the specific value to the listener.'),
('behavioral', 'communication', 'mid', 'low', 'How do you ensure your message is clearly understood?', 'Score 6: Active verification. Candidate mentions requesting confirmation of key details or setting clear "Next Steps" that the other party agrees to.'),
('behavioral', 'communication', 'mid', 'low', 'Describe a time when you had to present in front of a small group.', 'Score 6: Presence and structure. Focus on opening with a hook, maintaining eye contact, and managing a Q&A session effectively.'),
('behavioral', 'communication', 'mid', 'low', 'Tell me about a time when you clarified a misunderstanding.', 'Score 6: De-escalation. Candidate describes noticing a misalignment and using neutral language to bridge the gap before the issue intensified.'),
('behavioral', 'communication', 'mid', 'low', 'How do you adapt your communication style for different people?', 'Score 6: Person-centricity. Candidate identifies different types (Analytical vs Expressive) and social cues they use to adjust their tone and pace.'),
('behavioral', 'communication', 'mid', 'low', 'Describe a time when you had to provide instructions to a colleague.', 'Score 6: Delegatory clarity. Focus on providing the Goal, the Resources, and the Deadline, along with a "Why" to ensure commitment.'),
('behavioral', 'communication', 'mid', 'low', 'Tell me about a successful conversation that helped move a project forward.', 'Score 6: Outcome focus. Identifies a specific "blocker" that was removed through targeted communication rather than just formal progress updates.'),
('behavioral', 'communication', 'mid', 'low', 'How do you handle interruptions during meetings?', 'Score 6: Polite firmess. Candidate shows they can hold the floor or acknowledge the interruption while maintaining the primary agenda.'),
('behavioral', 'communication', 'mid', 'low', 'Describe a time when written communication was critical.', 'Score 6: Written impact. Focus on brevity, formatting (bullets, bolding), and ensuring the "Call to Action" was unmistakable.'),
('behavioral', 'communication', 'mid', 'low', 'Tell me about a time when good communication avoided a problem.', 'Score 6: Predictive communication. Candidate describes sounding an early alarm about a potential risk, allowing the team to adjust before it became a crisis.');

-- ------------------------------------------------------------------------------------------------
-- 5. COMMUNICATION (MEDIUM DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'communication', 'mid', 'medium', 'Tell me about a time you had to handle a client objection.', 'Score 6: Consultative handling. Candidate describes listening fully, empathizing, and then using evidence or a "Yes, and" approach to resolve the concern.'),
('behavioral', 'communication', 'mid', 'medium', 'Describe a situation where you had to persuade someone who was hesitant.', 'Score 6: Persuasion strategy. Candidate identifies the source of the hesitation (fear, cost, timing) and provides a specific reassurance or data point that moved them.'),
('behavioral', 'communication', 'mid', 'medium', 'How do you uncover a client’s real needs beyond what they initially state?', 'Score 6: Probing mastery. Candidate mentions "The 5 Whys" or open-ended discovery questions used to find the emotional or structural root of the need.'),
('behavioral', 'communication', 'mid', 'medium', 'Tell me about a time when you had to communicate under pressure.', 'Score 6: High-signal brevity. Candidate shows the ability to deliver crucial information clearly despite high stakes or time constraints.'),
('behavioral', 'communication', 'mid', 'medium', 'Describe a negotiation where maintaining the relationship was important.', 'Score 6: Win-Win mindset. Candidate explains how they balanced their own objectives with a genuine concern for the other party''s long-term satisfaction.'),
('behavioral', 'communication', 'mid', 'medium', 'Tell me about a time when you had to simplify a complex solution.', 'Score 6: Bridge building. Focus on removing jargon and using analogies that relevant stakeholders (like Finance or IT) can immediately grasp.'),
('behavioral', 'communication', 'mid', 'medium', 'How do you manage disagreement in professional discussions?', 'Score 6: Logical de-escalation. Candidate shows they focus on "What is right" rather than "Who is right," using objective data to settle the dispute.'),
('behavioral', 'communication', 'mid', 'medium', 'Describe a situation where you had to influence cross-functional teams.', 'Score 6: Matrix influence. Candidate shows they understood the "language" of other departments (Sales vs Engineering) and tailored their message to align goals.'),
('behavioral', 'communication', 'mid', 'medium', 'Tell me about a time when active listening changed the outcome.', 'Score 6: Detail detection. Candidate describes hearing a "minor comment" that changed their entire understanding of the client''s problem.'),
('behavioral', 'communication', 'mid', 'medium', 'How do you handle communication breakdown within a team?', 'Score 6: Restorative communication. Identifies a specific gap (culture, tool, process) and proposes a structured solution like a daily huddle or a shared tracker.');

-- ------------------------------------------------------------------------------------------------
-- 6. COMMUNICATION (HIGH DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'communication', 'mid', 'high', 'Tell me about a time when you had to influence multiple stakeholders with different priorities.', 'Score 6: Consensus building. Candidate describes mapping stakeholder interests and finding a "common denominator" that allowed all parties to say "Yes."'),
('behavioral', 'communication', 'mid', 'high', 'Describe a situation where your communication prevented a major escalation.', 'Score 6: Strategic de-escalation. Focus on early detection of a risk and the specific "diplomatic" conversation that lowered the temperature.'),
('behavioral', 'communication', 'mid', 'high', 'How do you tailor your messaging for senior leadership vs operational teams?', 'Score 6: Altitude adjustment. Candidate understands that leaders want "Outcome/Risk" while operations want "Process/Detail," and shows how they adapt the same data for both.'),
('behavioral', 'communication', 'mid', 'high', 'Tell me about a time when you had to deliver difficult news to a client.', 'Score 6: Radical transparency. Candidate shows they delivered the news directly, with empathy, and with a concrete plan for recovery/assistance.'),
('behavioral', 'communication', 'mid', 'high', 'Describe a time when miscommunication caused business impact. What did you learn?', 'Score 6: Systemic root cause analysis. Candidate identifies not just a personal error, but a flaw in the "Communication Channel" and how they fixed the process.'),
('behavioral', 'communication', 'mid', 'high', 'Tell me about a negotiation where you had to balance firmness and flexibility.', 'Score 6: Trade-off logic. Candidate demonstrates and explains their "Walk-away point" and where they were willing to give to gain a larger concession.'),
('behavioral', 'communication', 'mid', 'high', 'How do you handle emotionally charged conversations?', 'Score 6: Emotional intelligence. Candidate prioritizes acknowledging the emotion first to clear the path for a logical discussion afterward.'),
('behavioral', 'communication', 'mid', 'high', 'Describe a time when your communication style had to change mid-discussion.', 'Score 6: Real-time adaptivity. Candidate describes reading non-verbal "Resistance" and shifting from "Advocacy" to "Inquiry" to find the hidden objection.'),
('behavioral', 'communication', 'mid', 'high', 'Tell me about a time when you had to rebuild trust through communication.', 'Score 6: Accountability. Focus on the long-term consistency of messaging: Admit > Apologize > Act > Update consistently.'),
('behavioral', 'communication', 'mid', 'high', 'How do you ensure alignment when multiple stakeholders are involved?', 'Score 6: Governance. Mentions specific tools like RACI charts, shared briefs, or summary emails sent immediately after meetings to lock in alignment.');

-- ------------------------------------------------------------------------------------------------
-- 7. ADAPTABILITY (LOW DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'adaptability', 'mid', 'low', 'Tell me about adapting to a new manager.', 'Score 6: Relationship agility. Candidate shows they proactively scheduled a "working style discovery" chat to align expectations early.'),
('behavioral', 'adaptability', 'mid', 'low', 'Describe adjusting to new company policies.', 'Score 6: Pragmatism. Candidate shows they moved from "skeptical" to "compliant" by finding the organizational logic behind the new policy.'),
('behavioral', 'adaptability', 'mid', 'low', 'How do you handle sudden client requests?', 'Score 6: Agility and triage. Candidate shows how they paused their routine, assessed the priority, and fulfilled the request without dropping other balls.'),
('behavioral', 'adaptability', 'mid', 'low', 'Tell me about switching between projects.', 'Score 6: Context switching. Candidate mentions specific methods (Notes, Trello, ritualized transitions) used to maintain focus during rapid project changes.'),
('behavioral', 'adaptability', 'mid', 'low', 'Describe adapting to new tools or software.', 'Score 6: Tech curiosity. Candidate shows they didn''t just learn the basics but looked for advanced shortcuts to maintain their previous productivity levels.'),
('behavioral', 'adaptability', 'mid', 'low', 'Tell me about handling workload changes.', 'Score 6: Scalability. Candidate describes how they adjusted their personal pace or requested specific temporary help when the volume increased.'),
('behavioral', 'adaptability', 'mid', 'low', 'How do you respond to last-minute changes in meetings?', 'Score 6: Mental flexibility. Candidate shows they can pivot their preparation on the fly to address the new agenda without visible frustration.'),
('behavioral', 'adaptability', 'mid', 'low', 'Describe adapting to remote or hybrid work.', 'Score 6: Discipline and tool usage. Focus on proactive communication (Slack/Zoom) and setting clear "availability boundaries" to stay effective.'),
('behavioral', 'adaptability', 'mid', 'low', 'Tell me about working with cross-functional teams.', 'Score 6: Goal alignment. Candidate understands they are part of a larger machine and shows how they adjusted their own deliverables to help the other team succeed.'),
('behavioral', 'adaptability', 'mid', 'low', 'How do you manage unexpected travel or schedule changes?', 'Score 6: Resourcefulness. Candidate describes handling the logistics calmly while ensuring work output remained stable during the disruption.');

-- ------------------------------------------------------------------------------------------------
-- 8. ADAPTABILITY (MEDIUM DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'adaptability', 'mid', 'medium', 'Tell me about pivoting strategy mid-project.', 'Score 6: Decisiveness. Candidate explains the "data signal" that forced the pivot and the logical process of discarding the old plan for a better one.'),
('behavioral', 'adaptability', 'mid', 'medium', 'Describe responding to competitive pressure.', 'Score 6: Tactical agility. Candidate avoids panic and describes analyzing the competitor''s move before adjusting their own selling points or strategy.'),
('behavioral', 'adaptability', 'mid', 'medium', 'How do you adjust when targets change?', 'Score 6: Goal resilience. Candidate shows they immediately recalculated their effort-to-output ratio to meet the new, harder target.'),
('behavioral', 'adaptability', 'mid', 'medium', 'Tell me about adapting after losing a key client.', 'Score 6: Resilience and redirection. Candidate describes a brief post-loss analysis followed by an immediate pivot to high-value prospects in the pipeline.'),
('behavioral', 'adaptability', 'mid', 'medium', 'Describe working in ambiguous project scopes.', 'Score 6: Uncertainty tolerance. Candidate shows they created a "V1 prototype" or a "working draft" to force clarification rather than waiting for perfect info.'),
('behavioral', 'adaptability', 'mid', 'medium', 'Tell me about adapting to organizational restructuring.', 'Score 6: Corporate agility. Candidate focuses on where they could add most value in the "new world" rather than mourning the old structure.'),
('behavioral', 'adaptability', 'mid', 'medium', 'How do you respond when leadership direction shifts?', 'Score 6: Professional alignment. Candidate seeks to understand the "Higher Why" and translates it into actionable tasks for their own role.'),
('behavioral', 'adaptability', 'mid', 'medium', 'Describe switching between different client personas.', 'Score 6: Empathy agility. Candidate demonstrates and explains their "mental prep" for shifting from a CEO-level conversation to a Technical-level conversation.'),
('behavioral', 'adaptability', 'mid', 'medium', 'Tell me about adapting to new sales methodologies.', 'Score 6: Unlearning capability. Candidate describes letting go of an old, comfortable habit to master a more effective modern technique (e.g. Challenger vs Solution).'),
('behavioral', 'adaptability', 'mid', 'medium', 'How do you manage rapid market changes?', 'Score 6: Environment sensing. Candidate mentions sources (news, network) they monitor to stay ahead of the curve and adjust their talk-track accordingly.');

-- ------------------------------------------------------------------------------------------------
-- 9. ADAPTABILITY (HIGH DIFFICULTY - MID)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'adaptability', 'mid', 'high', 'Tell me about leading adaptation during major change.', 'Score 6: Change leadership. Focus on how they modeled the new behavior for others and provided emotional support while maintaining performance standards.'),
('behavioral', 'adaptability', 'mid', 'high', 'Describe managing uncertainty during economic downturn.', 'Score 6: Crisis agility. Candidate shows how they "tightened the ship"—focusing only on high-certainty activities and managing resources with extreme care.'),
('behavioral', 'adaptability', 'mid', 'high', 'How do you handle conflicting priorities from different leaders?', 'Score 6: Decision-making. Candidate describes a "Priority Matrix" conversation where they brought all leaders together to resolve the conflict logically.'),
('behavioral', 'adaptability', 'mid', 'high', 'Tell me about pivoting a failing strategy.', 'Score 6: Analytical courage. Candidate identifies the "Sunk Cost" fallacy and describes the evidence they used to kill a project and start a better one.'),
('behavioral', 'adaptability', 'mid', 'high', 'Describe adapting to cultural differences in business.', 'Score 6: Cultural intelligence (CQ). Candidate mentions researching norms and adjusting their negotiation style to ensure a respectful and successful outcome.'),
('behavioral', 'adaptability', 'mid', 'high', 'How do you make decisions when data is incomplete?', 'Score 6: Heuristic judgment. Candidate explains their "Probability-based" decision framework and how they built in "reversibility" in case the decision was wrong.'),
('behavioral', 'adaptability', 'mid', 'high', 'Tell me about handling digital transformation changes.', 'Score 6: Future orientation. Candidate shows they didn''t just adopt the new tech, but became an internal "power user" or trainer to help the transformation succeed.'),
('behavioral', 'adaptability', 'mid', 'high', 'Describe adapting to performance under resource constraints.', 'Score 6: Frugal innovation. Focus on the creative "workaround" or process hack used to achieve the target without the usual budget or headcount.'),
('behavioral', 'adaptability', 'mid', 'high', 'How do you manage innovation while maintaining stability?', 'Score 6: Balanced agility. Candidate describes an "Experimentation budget" (of time/resources) used to test new ideas while keeping the core business safe.'),
('behavioral', 'adaptability', 'mid', 'high', 'Tell me about balancing short-term needs with long-term strategy.', 'Score 6: Strategic harmony. Candidate shows they can make a "short-term sacrifice" for a "long-term gain," justifying it through future-value or outcome modeling.');
