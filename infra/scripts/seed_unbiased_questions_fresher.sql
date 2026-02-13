-- Unbiased Behavioral Questions Seed Script
-- Experience Band: Fresher
-- Drivers: Resilience, Communication, Adaptability
-- Implementation: Intent-based rubrics for Gemini 1.5 Flash evaluation

-- ------------------------------------------------------------------------------------------------
-- 1. RESILIENCE (LOW DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'resilience', 'fresher', 'low', 'Tell me about a time you did not succeed in something you wanted.', 'Score 6: Candidate identifies a specific instance of failure, expresses honest disappointment, and clearly states what they did to move forward without blaming others.'),
('behavioral', 'resilience', 'fresher', 'low', 'How do you usually react when you receive criticism?', 'Score 6: Candidate demonstrates an open mindset, views criticism as feedback for growth, and mentions a specific example of how they processed feedback effectively.'),
('behavioral', 'resilience', 'fresher', 'low', 'Describe a time when you had to try again after failing the first time.', 'Score 6: Focus on persistence. Candidate should explain why the goal was important and what specific adjustment they made during the second attempt.'),
('behavioral', 'resilience', 'fresher', 'low', 'What do you do when something doesn’t go according to plan?', 'Score 6: Candidate shows flexibility and emotional control. They should describe a "pivot" moment where they looked for an alternative solution.'),
('behavioral', 'resilience', 'fresher', 'low', 'Share an example of a time you felt disappointed. What did you do next?', 'Score 6: Emotional maturity. Candidate acknowledges the feeling but emphasizes the "next step" or the recovery process.'),
('behavioral', 'resilience', 'fresher', 'low', 'Tell me about a small goal you struggled to achieve.', 'Score 6: Honesty about the struggle. Candidate explains the obstacle clearly and demonstrates the effort used to overcome it.'),
('behavioral', 'resilience', 'fresher', 'low', 'How do you stay motivated during difficult tasks?', 'Score 6: Self-regulation. Candidate identifies a personal strategy (breaking tasks down, focus on the end goal, etc.) rather than just waiting for external help.'),
('behavioral', 'resilience', 'fresher', 'low', 'Have you ever faced rejection? How did it make you feel?', 'Score 6: Vulnerability and resilience. Candidate admits the feeling of rejection but shows how they used it as a learning point for future attempts.'),
('behavioral', 'resilience', 'fresher', 'low', 'Describe a time when you wanted to quit but didn’t.', 'Score 6: Grit. Candidate explains the source of the fatigue and the specific reason or motivation that kept them going.'),
('behavioral', 'resilience', 'fresher', 'low', 'What do you do when your effort is not appreciated?', 'Score 6: Professionalism. Candidate shows internal validation and the ability to continue performing high-quality work regardless of external praise.');

-- ------------------------------------------------------------------------------------------------
-- 2. RESILIENCE (MEDIUM DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'resilience', 'fresher', 'medium', 'Tell me about a time you failed because of your own mistake. What did you learn?', 'Score 6: High ownership score. Candidate admits the mistake without excuses and provides a concrete "lesson learned" that they have applied since.'),
('behavioral', 'resilience', 'fresher', 'medium', 'Describe a situation where repeated attempts were required to succeed.', 'Score 6: Process focus. Candidate details the incremental improvements made during each attempt and the stamina required to finish.'),
('behavioral', 'resilience', 'fresher', 'medium', 'When you miss a deadline, how do you handle it?', 'Score 6: Accountability and communication. Candidate mentions early warning to stakeholders, taking responsibility, and a plan to prevent a recurrence.'),
('behavioral', 'resilience', 'fresher', 'medium', 'Tell me about a time when you felt overwhelmed but had to continue.', 'Score 6: Stress management. Candidate identifies how they prioritized tasks and managed their mental state to complete the objective.'),
('behavioral', 'resilience', 'fresher', 'medium', 'Describe a situation where you received tough feedback. How did you respond?', 'Score 6: Behavioral pivot. Candidate explains how they suppressed defensiveness, asked clarifying questions, and changed their actions based on the feedback.'),
('behavioral', 'resilience', 'fresher', 'medium', 'Share an example of how you improved after a setback.', 'Score 6: Growth trajectory. Focus on the Delta—the measurable difference in performance before and after the setback.'),
('behavioral', 'resilience', 'fresher', 'medium', 'Tell me about a time when others doubted your ability. What happened?', 'Score 6: Internal strength. Candidate demonstrates how they relied on evidence and hard work to prove their capability rather than engaging in conflict.'),
('behavioral', 'resilience', 'fresher', 'medium', 'How do you deal with losing in a competitive environment?', 'Score 6: Sportsmanship and analysis. Candidate shows respect for the winner and an analytical approach to why they lost and how to improve.'),
('behavioral', 'resilience', 'fresher', 'medium', 'Describe a situation where you had to remain calm under pressure.', 'Score 6: Composure. Candidate describes a high-stakes moment and the specific technique (breathing, listing, etc.) used to maintain logical thinking.'),
('behavioral', 'resilience', 'fresher', 'medium', 'Tell me about a time you had to stay focused despite distractions or discouragement.', 'Score 6: Focus control. Candidate defines the distraction and the cognitive strategy used to maintain the "deep work" required for the task.');

-- ------------------------------------------------------------------------------------------------
-- 3. RESILIENCE (HIGH DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'resilience', 'fresher', 'high', 'Tell me about a failure that changed how you approach challenges today.', 'Score 6: Philosophical growth. Candidate links a past failure to a current, permanent strategy for handling difficulty.'),
('behavioral', 'resilience', 'fresher', 'high', 'Describe a situation where you were unfairly criticized. How did you respond?', 'Score 6: Emotional intelligence. Candidate demonstrates the ability to separate pride from productivity and how they handled the unfairness with professional poise.'),
('behavioral', 'resilience', 'fresher', 'high', 'When do you decide to persist versus step back from something?', 'Score 6: Judgment. Candidate provides a logical framework for evaluating ROI vs. sunk cost, showing they don''t just persist blindly.'),
('behavioral', 'resilience', 'fresher', 'high', 'Tell me about a long-term goal that required sustained effort despite setbacks.', 'Score 6: Long-arc resilience. Focus on the ability to maintain vision over months or years, managing "micro-failures" along the way.'),
('behavioral', 'resilience', 'fresher', 'high', 'Describe a time when your confidence was shaken. How did you rebuild it?', 'Score 6: Self-reconstruction. Candidate describes the internal work (self-talk, skill building, seeking mentorship) used to return to a high-performance state.'),
('behavioral', 'resilience', 'fresher', 'high', 'Have you ever experienced burnout or mental fatigue? How did you manage it?', 'Score 6: Self-awareness. Candidate recognizes early signs of burnout and describes a proactive system for recovery and future prevention.'),
('behavioral', 'resilience', 'fresher', 'high', 'Tell me about a time when external circumstances made success difficult.', 'Score 6: Externalities. Candidate shows they didn''t use circumstances as an excuse, but worked around them or found a creative path to the goal.'),
('behavioral', 'resilience', 'fresher', 'high', 'Describe how you handle situations where results are outside your control.', 'Score 6: Acceptance and focus. Candidate identifies that they focus only on their "circle of influence" (inputs) when the outputs are volatile.'),
('behavioral', 'resilience', 'fresher', 'high', 'What is the biggest personal setback you’ve faced, and what did it teach you?', 'Score 6: Transformative learning. A deep, reflective answer that shows the setback was a catalyst for a significant positive change in character.'),
('behavioral', 'resilience', 'fresher', 'high', 'Tell me about a time when you had to motivate yourself without external encouragement.', 'Score 6: Intrinsic motivation. Candidate clearly defines their "Why" and how it sustained them when there was no validation from others.');

-- ------------------------------------------------------------------------------------------------
-- 4. COMMUNICATION (LOW DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'communication', 'fresher', 'low', 'Tell me about a time you had to explain something to a classmate or friend.', 'Score 6: Clarity. Candidate breaks down a concept into simple steps and mentions checking if the listener understood.'),
('behavioral', 'communication', 'fresher', 'low', 'How do you make sure someone understands what you are saying?', 'Score 6: Feedback loop. Candidate mentions asking clarifying questions or requesting the person to repeat the instruction in their own words.'),
('behavioral', 'communication', 'fresher', 'low', 'Describe a time when you asked a question to clarify something.', 'Score 6: Active listening. Candidate shows they were attentive enough to spot an ambiguity and brave enough to ask for clarification early.'),
('behavioral', 'communication', 'fresher', 'low', 'Tell me about a presentation you gave. How did you prepare?', 'Score 6: Preparation. Focus on structure, practice, and considering what the audience needed to know.'),
('behavioral', 'communication', 'fresher', 'low', 'How do you handle situations when someone interrupts you while speaking?', 'Score 6: Poise. Candidate shows they can respectfully finish their thought or pause and reintegrate without becoming defensive or aggressive.'),
('behavioral', 'communication', 'fresher', 'low', 'Describe a time when you worked in a group discussion.', 'Score 6: Participation and balance. Candidate shows they can contribute their own ideas while also actively listening to and acknowledging others'' points.'),
('behavioral', 'communication', 'fresher', 'low', 'How do you adjust your language when speaking to seniors vs peers?', 'Score 6: Awareness. Candidate recognizes the need for higher formality and brevity with seniors, and more collaborative/informal tone with peers.'),
('behavioral', 'communication', 'fresher', 'low', 'Tell me about a time when you had to give instructions to someone.', 'Score 6: Instruction quality. Check for step-by-step logic and the inclusion of a "reason why" to help the other person perform the task.'),
('behavioral', 'communication', 'fresher', 'low', 'What do you do if someone doesn’t agree with you?', 'Score 6: Respectful inquiry. Candidate mentions trying to understand the other person''s perspective before trying to re-explain their own.'),
('behavioral', 'communication', 'fresher', 'low', 'Describe a situation where clear communication helped avoid confusion.', 'Score 6: Outcome focus. Candidate describes a "pre-emptive" strike of clarity (like a summary email or a quick chat) that prevented a mistake.');

-- ------------------------------------------------------------------------------------------------
-- 5. COMMUNICATION (MEDIUM DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'communication', 'fresher', 'medium', 'Tell me about a time you had to convince someone to support your idea.', 'Score 6: Persuasion with evidence. Candidate shows they used data, logic, or a benefit-to-the-other-person approach rather than just repeating their opinion.'),
('behavioral', 'communication', 'fresher', 'medium', 'Describe a situation where there was a misunderstanding. How did you resolve it?', 'Score 6: Resolution. Candidate takes partial responsibility for the gap, focuses on "clarifying the future" rather than "blaming the past."'),
('behavioral', 'communication', 'fresher', 'medium', 'How do you handle disagreement during a team discussion?', 'Score 6: Collaborative de-escalation. Candidate uses "I" statements, seeks common ground, and focuses on the team objective over being right.'),
('behavioral', 'communication', 'fresher', 'medium', 'Tell me about a time when you had to simplify a complex topic.', 'Score 6: Abstraction skill. Candidate uses analogies or removes jargon to make a difficult concept accessible to a non-expert.'),
('behavioral', 'communication', 'fresher', 'medium', 'Describe how you handle receiving negative feedback in front of others.', 'Score 6: Professional dignity. Candidate shows they can remain calm, acknowledge the feedback, and request a private follow-up if needed to avoid public conflict.'),
('behavioral', 'communication', 'fresher', 'medium', 'Tell me about a time when you had to communicate under time pressure.', 'Score 6: Efficiency. Candidate demonstrates the ability to strip away non-essential info and provide a high-signal "bottom line up front" (BLUF) message.'),
('behavioral', 'communication', 'fresher', 'medium', 'How do you ensure active listening during conversations?', 'Score 6: Technique. Candidate mentions summarizing, nodding, removing distractions, and asking follow-up questions that prove they were listening.'),
('behavioral', 'communication', 'fresher', 'medium', 'Describe a time when your communication style caused confusion.', 'Score 6: Self-correction. Candidate identifies their own error (e.g., being too detailed), explains how they noticed the confusion, and how they corrected it.'),
('behavioral', 'communication', 'fresher', 'medium', 'Tell me about a time when you had to communicate bad news.', 'Score 6: Empathy and solution. Candidate delivers the direct truth with kindness and immediately provides a potential next step or support.'),
('behavioral', 'communication', 'fresher', 'medium', 'How do you structure your thoughts before speaking in an important discussion?', 'Score 6: Intentionality. Candidate mentions mental bullet points, a beginning-middle-end structure, or focusing on the "Target Outcome" of the speech.');

-- ------------------------------------------------------------------------------------------------
-- 6. COMMUNICATION (HIGH DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'communication', 'fresher', 'high', 'Tell me about a time when your message was misunderstood despite your effort. Why do you think that happened?', 'Score 6: Deep analysis. Candidate looks at cultural, medium, or noise-related factors and proposes a structural change to their communication strategy.'),
('behavioral', 'communication', 'fresher', 'high', 'Describe a situation where you had to influence someone who strongly disagreed with you.', 'Score 6: Influence strategy. Candidate shows they built rapport first, mapped the other person''s objections, and adjusted their message to align with the other''s values.'),
('behavioral', 'communication', 'fresher', 'high', 'How do you handle communication with someone who is emotionally upset?', 'Score 6: De-escalation and empathy. Candidate shows they prioritize "lowering the temperature" and listening over "Winning the argument" or logic-bombing.'),
('behavioral', 'communication', 'fresher', 'high', 'Tell me about a time when you had to adjust your communication style mid-conversation.', 'Score 6: Adaptive intelligence. Candidate describes reading non-verbal cues (boredom, confusion) and immediately changing their tone or level of detail.'),
('behavioral', 'communication', 'fresher', 'high', 'Describe a situation where listening was more important than speaking.', 'Score 6: Strategic silence. Candidate explains how withholding their opinion allowed them to gather crucial data that changed the eventual solution.'),
('behavioral', 'communication', 'fresher', 'high', 'Have you ever had to challenge someone respectfully? What approach did you use?', 'Score 6: Constructive conflict. Focus on challenging the *idea* not the *person*, using evidence-based questions rather than statements.'),
('behavioral', 'communication', 'fresher', 'high', 'Tell me about a time when your non-verbal communication impacted the outcome.', 'Score 6: Body language awareness. Candidate understands how their tone, eye contact, or posture either reinforced or undermined their verbal message.'),
('behavioral', 'communication', 'fresher', 'high', 'How do you balance confidence and humility when presenting ideas?', 'Score 6: Nuance. Candidate explains they are confident in the *research/logic* but humble about the *outcome/implementation*, inviting others to improve the plan.'),
('behavioral', 'communication', 'fresher', 'high', 'Describe a time when you had to speak up even though you were nervous.', 'Score 6: Courage. Candidate demonstrates that their commitment to the group outcome or the truth was stronger than their personal fear.'),
('behavioral', 'communication', 'fresher', 'high', 'If a team conflict arises due to miscommunication, how would you resolve it?', 'Score 6: Mediation. Focus on bringing parties together, establishing shared definitions, and creating a "communication contract" to prevent the next conflict.');

-- ------------------------------------------------------------------------------------------------
-- 7. ADAPTABILITY (LOW DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'adaptability', 'fresher', 'low', 'Tell me about a time when your plans changed unexpectedly.', 'Score 6: Ease of shift. Candidate shows they didn''t waste time complaining but immediately asked, "What is the new priority?"'),
('behavioral', 'adaptability', 'fresher', 'low', 'How do you react when you are given a new task at the last minute?', 'Score 6: Positivity and throughput. Candidate mentions clarifying the urgency and then integrating the new task into their workflow without panic.'),
('behavioral', 'adaptability', 'fresher', 'low', 'Describe a time when you had to adjust to a new schedule.', 'Score 6: Habit adjustment. Candidate shows they modified their personal routine or preparation style to accommodate the change effectively.'),
('behavioral', 'adaptability', 'fresher', 'low', 'Tell me about a time you had to learn something new for a project.', 'Score 6: Learning speed. Candidate identifies the tool/skill and the specific, fast-track learning method they used (tutorials, peer shadowing, etc.).'),
('behavioral', 'adaptability', 'fresher', 'low', 'How do you handle working with different types of people?', 'Score 6: Social flexibility. Candidate avoids generalizations and mentions looking for the strengths in diverse working styles.'),
('behavioral', 'adaptability', 'fresher', 'low', 'Describe a situation where you had to follow new rules or instructions.', 'Score 6: Compliance and logic. Candidate shows they can adopt a new process quickly while understanding why the change was made.'),
('behavioral', 'adaptability', 'fresher', 'low', 'Tell me about a time when you had to step out of your comfort zone.', 'Score 6: Risk-taking. Candidate defines the "fear factor" and explains why they decided the goal was worth the discomfort.'),
('behavioral', 'adaptability', 'fresher', 'low', 'How do you respond when your routine is disrupted?', 'Score 6: Recovery. Candidate shows they have a "fallback" system allowing them to stay productive despite the interruption.'),
('behavioral', 'adaptability', 'fresher', 'low', 'Describe a time when you had to multitask.', 'Score 6: Task switching. Candidate shows how they kept track of multiple threads without letting any "drop," demonstrating structured attention.'),
('behavioral', 'adaptability', 'fresher', 'low', 'Tell me about a time when you had to quickly understand a new topic.', 'Score 6: Synthesis. Candidate explains how they identified the "core principles" of a new topic to get up to speed within hours or days.');

-- ------------------------------------------------------------------------------------------------
-- 8. ADAPTABILITY (MEDIUM DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'adaptability', 'fresher', 'medium', 'Tell me about a time when a project requirement changed midway. What did you do?', 'Score 6: Pivot efficiency. Candidate demonstrates discarding the old work without emotional attachment and moving rapidly to the new direction.'),
('behavioral', 'adaptability', 'fresher', 'medium', 'Describe a situation where you had to take on a responsibility outside your usual role.', 'Score 6: Extension. Candidate shows curiosity and a "can-do" attitude, doing their own research to master the unexpected duty.'),
('behavioral', 'adaptability', 'fresher', 'medium', 'How do you manage when priorities shift suddenly?', 'Score 6: Triage skill. Candidate explains how they re-negotiate deadlines or communicate with stakeholders about what will be delayed and why.'),
('behavioral', 'adaptability', 'fresher', 'medium', 'Tell me about a time when you had to learn a new tool or software quickly.', 'Score 6: Depth of learning. Candidate mentions not just using the tool, but discovering a feature or shortcut that improved the project outcome.'),
('behavioral', 'adaptability', 'fresher', 'medium', 'Describe a time when you had to work with someone whose style was very different from yours.', 'Score 6: Style bridging. Candidate shows they adjusted their own style to mesh with the other person, creating a more effective partnership.'),
('behavioral', 'adaptability', 'fresher', 'medium', 'Tell me about a situation where you had limited information but still had to act.', 'Score 6: Decision-making. Candidate explains how they used the 20% of info they had to make a 100% effort, maintaining a "bias for action."'),
('behavioral', 'adaptability', 'fresher', 'medium', 'How do you handle uncertainty when expectations are unclear?', 'Score 6: Proactivity. Candidate doesn''t wait for orders—they propose a direction and ask for verification, "creating clarity from chaos."'),
('behavioral', 'adaptability', 'fresher', 'medium', 'Describe a time when you had to adapt after receiving critical feedback.', 'Score 6: Applied change. Focus on the actual change in behavior that persisted months after the feedback was given.'),
('behavioral', 'adaptability', 'fresher', 'medium', 'Tell me about a time when you had to switch strategies to complete a task.', 'Score 6: Solution-oriented thinking. Candidate recognizes why Strategy A was failing and documents the logical reason for moving to Strategy B.'),
('behavioral', 'adaptability', 'fresher', 'medium', 'How do you respond when your original solution does not work?', 'Score 6: Humility and iteration. Candidate shows they aren''t "married to their ideas" and can rapidly test a second hypothesis.');

-- ------------------------------------------------------------------------------------------------
-- 9. ADAPTABILITY (HIGH DIFFICULTY)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.assessment_questions (category, driver, experience_band, difficulty, question_text, evaluation_rubric) VALUES
('behavioral', 'adaptability', 'fresher', 'high', 'Tell me about a time when you had to make a decision without full information.', 'Score 6: Calculated risk. Candidate explains their "assumption-based reasoning" and how they built a safety net while moving forward.'),
('behavioral', 'adaptability', 'fresher', 'high', 'Describe a situation where multiple unexpected challenges occurred at once.', 'Score 6: Crisis management. Focus on the ability to remain calm, segment the problems, and solve them sequentially without becoming paralyzed.'),
('behavioral', 'adaptability', 'fresher', 'high', 'How do you approach situations where there is no clear right answer?', 'Score 6: Ambiguity tolerance. Candidate provides a framework (logic, values, or outcome-based) they use to navigate "Gray areas."'),
('behavioral', 'adaptability', 'fresher', 'high', 'Tell me about a time when you had to unlearn something to learn a better way.', 'Score 6: Ego dissolution. Candidate shows the ability to let go of "how we''ve always done it" to adopt a more efficient, modern method.'),
('behavioral', 'adaptability', 'fresher', 'high', 'Describe a time when your assumptions were proven wrong. How did you adjust?', 'Score 6: Intellectual honesty. Candidate demonstrates the ability to pivot immediately upon finding new data that contradicts their belief.'),
('behavioral', 'adaptability', 'fresher', 'high', 'How do you handle working in an environment where expectations keep changing?', 'Score 6: Systemized flexibility. Candidate mentions building "flexible systems"—tools or habits that can handle high volatility without breaking.'),
('behavioral', 'adaptability', 'fresher', 'high', 'Tell me about a time when you had to manage both academic and personal challenges simultaneously.', 'Score 6: Resilience integration. Focus on the ability to maintain performance levels across different life domains during a storm.'),
('behavioral', 'adaptability', 'fresher', 'high', 'Describe a situation where you had to adapt your working style to succeed in a team.', 'Score 6: Group-centric adaptation. Candidate shows they consciously suppressed a personal preference for the sake of the team''s higher efficiency.'),
('behavioral', 'adaptability', 'fresher', 'high', 'Tell me about a time when you took initiative during uncertainty.', 'Score 6: Leadership in flux. Candidate describes a moment where they stepped into a vacuum of direction and provided a roadmap for others.'),
('behavioral', 'adaptability', 'fresher', 'high', 'If assigned to a completely unfamiliar domain tomorrow, how would you approach it?', 'Score 6: First Principles thinking. Candidate doesn''t panic; they describe a structured "onboarding plan" involving research, mental models, and seeking experts.');
