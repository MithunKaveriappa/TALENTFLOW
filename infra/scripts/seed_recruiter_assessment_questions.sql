-- Recruiter Assessment Questions Seed Script
-- Categories: Strategic Intent & Universal DNA, ICP Understanding, Ethics & Fair Hiring, Candidate Value Proposition, Decision-Making & Ownership
-- Total: 125 Questions (25 per category)

-- ------------------------------------------------------------------------------------------------
-- 1. STRATEGIC INTENT & UNIVERSAL DNA (25 Questions)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.recruiter_assessment_questions (category, driver, question_text) VALUES
('recruiter_intent', 'Strategic Intent', 'What is the primary reason your company is growing right now?'),
('recruiter_intent', 'Strategic Intent', 'What long-term vision is guiding your company’s current expansion decisions?'),
('recruiter_intent', 'Strategic Intent', 'What problem in the market is your company fundamentally trying to solve?'),
('recruiter_intent', 'Strategic Intent', 'What must your company achieve in the next 12 months to consider it a successful year?'),
('recruiter_intent', 'Strategic Intent', 'Why does your company exist beyond generating revenue?'),
('recruiter_intent', 'Strategic Intent', 'What makes your company’s direction different from competitors in your space?'),
('recruiter_intent', 'Strategic Intent', 'What internal shift or milestone triggered your current hiring activity?'),
('recruiter_intent', 'Universal DNA', 'What are three non-negotiable traits required to succeed in your company culture?'),
('recruiter_intent', 'Universal DNA', 'Why are those traits critical for survival in your environment?'),
('recruiter_intent', 'Universal DNA', 'What behaviours are rewarded most strongly inside your company?'),
('recruiter_intent', 'Universal DNA', 'What behaviours are not tolerated in your company, regardless of performance?'),
('recruiter_intent', 'Universal DNA', 'What type of mindset thrives in your company?'),
('recruiter_intent', 'Universal DNA', 'What type of mindset struggles in your company?'),
('recruiter_intent', 'Universal DNA', 'How would you describe your company’s operating philosophy in one sentence?'),
('recruiter_intent', 'Strategic Intent', 'When facing uncertainty, what principle guides major decisions?'),
('recruiter_intent', 'Strategic Intent', 'How does your company balance speed versus perfection?'),
('recruiter_intent', 'Strategic Intent', 'How are strategic priorities decided internally?'),
('recruiter_intent', 'Universal DNA', 'What defines a “top performer” in your company’s culture?'),
('recruiter_intent', 'Universal DNA', 'What company value is most tested during challenging periods?'),
('recruiter_intent', 'Strategic Intent', 'What has been the most important strategic lesson your company has learned recently?'),
('recruiter_intent', 'Strategic Intent', 'What internal capability is most critical for your company’s long-term survival?'),
('recruiter_intent', 'Strategic Intent', 'What kind of growth does your company prioritize: revenue, market share, innovation, stability, or something else?'),
('recruiter_intent', 'Strategic Intent', 'What trade-offs is your company willing to make to achieve its goals?'),
('recruiter_intent', 'Strategic Intent', 'What does success look like for your company three years from now?'),
('recruiter_intent', 'Universal DNA', 'If someone joins your company, what must they emotionally and professionally align with to thrive?');

-- ------------------------------------------------------------------------------------------------
-- 2. ICP UNDERSTANDING (IDEAL PROFILE) (25 Questions)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.recruiter_assessment_questions (category, driver, question_text) VALUES
('recruiter_icp', 'Ideal Profile', 'What defines an ideal candidate in your company?'),
('recruiter_icp', 'Ideal Profile', 'What separates a top performer from an average performer in your environment?'),
('recruiter_icp', 'Ideal Profile', 'What past experiences tend to predict success in your company?'),
('recruiter_icp', 'Ideal Profile', 'What practical skills are truly essential versus simply “nice to have”?'),
('recruiter_icp', 'Ideal Profile', 'What level of autonomy do you expect from someone joining your company?'),
('recruiter_icp', 'Ideal Profile', 'How do you distinguish between potential and proven ability?'),
('recruiter_icp', 'Ideal Profile', 'What type of professional background aligns best with your company’s pace and expectations?'),
('recruiter_icp', 'Ideal Profile', 'What behaviours indicate someone will succeed long-term in your organization?'),
('recruiter_icp', 'Ideal Profile', 'What common hiring mistakes do companies in your industry often make?'),
('recruiter_icp', 'Ideal Profile', 'What unrealistic expectations do candidates sometimes have about working in your company?'),
('recruiter_icp', 'Ideal Profile', 'What kind of learning curve should someone realistically expect in the first few months?'),
('recruiter_icp', 'Ideal Profile', 'What performance standards are non-negotiable in your company?'),
('recruiter_icp', 'Ideal Profile', 'What mindset is required to operate effectively in your company?'),
('recruiter_icp', 'Ideal Profile', 'How do you evaluate whether someone can handle pressure or ambiguity?'),
('recruiter_icp', 'Ideal Profile', 'What communication style works best in your organization?'),
('recruiter_icp', 'Ideal Profile', 'What level of accountability do you expect from someone you hire?'),
('recruiter_icp', 'Ideal Profile', 'What early indicators tell you that someone is likely to become a high-impact contributor?'),
('recruiter_icp', 'Ideal Profile', 'What professional habits differentiate strong contributors in your company?'),
('recruiter_icp', 'Ideal Profile', 'What kind of candidate would look strong on paper but struggle in your environment?'),
('recruiter_icp', 'Ideal Profile', 'How important is cultural alignment compared to technical capability?'),
('recruiter_icp', 'Ideal Profile', 'What evidence do you look for to confirm someone can deliver results?'),
('recruiter_icp', 'Ideal Profile', 'What type of work ethic aligns best with your company standards?'),
('recruiter_icp', 'Ideal Profile', 'How do you assess whether someone can collaborate effectively within your culture?'),
('recruiter_icp', 'Ideal Profile', 'What growth potential do you expect from someone over their first year?'),
('recruiter_icp', 'Ideal Profile', 'If you had to describe your ideal hire in three defining characteristics, what would they be?');

-- ------------------------------------------------------------------------------------------------
-- 3. ETHICS & FAIR HIRING PRACTICES (25 Questions)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.recruiter_assessment_questions (category, driver, question_text) VALUES
('recruiter_ethics', 'Ethics & Fairness', 'How do you ensure fairness in your hiring decisions?'),
('recruiter_ethics', 'Ethics & Fairness', 'What steps do you take to prevent bias during candidate evaluation?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you communicate expectations clearly to candidates during the hiring process?'),
('recruiter_ethics', 'Ethics & Fairness', 'What does a transparent hiring process look like in your company?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you decide which candidate moves forward at each stage?'),
('recruiter_ethics', 'Ethics & Fairness', 'What criteria are used to evaluate candidates consistently?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you ensure candidates are treated respectfully throughout the process?'),
('recruiter_ethics', 'Ethics & Fairness', 'What is your approach to providing feedback to candidates?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you handle disagreements internally about a hiring decision?'),
('recruiter_ethics', 'Ethics & Fairness', 'What safeguards exist to prevent “gut feeling” decisions?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you communicate timelines and next steps to candidates?'),
('recruiter_ethics', 'Ethics & Fairness', 'What happens if a candidate is not selected — how is that communicated?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you ensure all candidates are evaluated against the same standards?'),
('recruiter_ethics', 'Ethics & Fairness', 'What documentation or structure supports your hiring decisions?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you balance speed with fairness in hiring?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you handle confidential candidate information?'),
('recruiter_ethics', 'Ethics & Fairness', 'What ethical principles guide your hiring practices?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you measure whether your hiring process is effective and fair?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you ensure equal opportunity regardless of background?'),
('recruiter_ethics', 'Ethics & Fairness', 'What actions would you take if you discovered bias in your hiring process?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you align hiring decisions with company values?'),
('recruiter_ethics', 'Ethics & Fairness', 'What does professionalism in hiring mean to you?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you set realistic expectations about compensation and growth?'),
('recruiter_ethics', 'Ethics & Fairness', 'How do you ensure candidates understand the evaluation criteria?'),
('recruiter_ethics', 'Ethics & Fairness', 'What accountability mechanisms exist if a hiring decision is later questioned?');

-- ------------------------------------------------------------------------------------------------
-- 4. CANDIDATE VALUE PROPOSITION (25 Questions)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.recruiter_assessment_questions (category, driver, question_text) VALUES
('recruiter_cvp', 'Value Proposition', 'Why should a strong candidate choose your company over competitors?'),
('recruiter_cvp', 'Value Proposition', 'What long-term growth opportunities does your company offer?'),
('recruiter_cvp', 'Value Proposition', 'What kind of professional development can someone expect in your company?'),
('recruiter_cvp', 'Value Proposition', 'How does your company support skill expansion and continuous learning?'),
('recruiter_cvp', 'Value Proposition', 'What meaningful impact can someone have by joining your organization?'),
('recruiter_cvp', 'Value Proposition', 'What exposure to leadership or strategic decisions does your company provide?'),
('recruiter_cvp', 'Value Proposition', 'How does your company help individuals grow beyond their current capabilities?'),
('recruiter_cvp', 'Value Proposition', 'What type of challenges can someone expect in your environment?'),
('recruiter_cvp', 'Value Proposition', 'What makes your company a valuable place for career progression?'),
('recruiter_cvp', 'Value Proposition', 'How does your company recognize and reward strong performance?'),
('recruiter_cvp', 'Value Proposition', 'What differentiates your work environment from others in your industry?'),
('recruiter_cvp', 'Value Proposition', 'What kind of mentorship or guidance is available internally?'),
('recruiter_cvp', 'Value Proposition', 'How does your company support long-term career development?'),
('recruiter_cvp', 'Value Proposition', 'What internal mobility or advancement opportunities exist?'),
('recruiter_cvp', 'Value Proposition', 'What type of projects or initiatives provide meaningful learning experiences?'),
('recruiter_cvp', 'Value Proposition', 'How does your company foster innovation or creative contribution?'),
('recruiter_cvp', 'Value Proposition', 'What cultural strengths make your company attractive to ambitious professionals?'),
('recruiter_cvp', 'Value Proposition', 'How does your company ensure employees feel valued?'),
('recruiter_cvp', 'Value Proposition', 'What kind of professional network exposure does your company provide?'),
('recruiter_cvp', 'Value Proposition', 'How does your company balance performance expectations with personal development?'),
('recruiter_cvp', 'Value Proposition', 'What makes your company a place where people build lasting careers?'),
('recruiter_cvp', 'Value Proposition', 'What kind of autonomy does someone gain over time in your organization?'),
('recruiter_cvp', 'Value Proposition', 'How does your company invest in employee capability building?'),
('recruiter_cvp', 'Value Proposition', 'What long-term value does someone gain from spending several years at your company?'),
('recruiter_cvp', 'Value Proposition', 'If someone leaves your company after a few years, what should they have gained professionally?');

-- ------------------------------------------------------------------------------------------------
-- 5. DECISION-MAKING & OWNERSHIP (25 Questions)
-- ------------------------------------------------------------------------------------------------
INSERT INTO public.recruiter_assessment_questions (category, driver, question_text) VALUES
('recruiter_ownership', 'Decision-Making', 'Who ultimately owns hiring decisions in your company?'),
('recruiter_ownership', 'Decision-Making', 'How are final decisions made when multiple stakeholders are involved?'),
('recruiter_ownership', 'Decision-Making', 'What prevents hiring decisions from becoming delayed or bureaucratic?'),
('recruiter_ownership', 'Decision-Making', 'How do you ensure accountability in the hiring process?'),
('recruiter_ownership', 'Decision-Making', 'What is your expected timeline from initial conversation to final decision?'),
('recruiter_ownership', 'Decision-Making', 'How do you handle situations where decision-makers disagree?'),
('recruiter_ownership', 'Decision-Making', 'What level of authority do hiring managers have in your company?'),
('recruiter_ownership', 'Decision-Making', 'How do you prevent indecision during the hiring process?'),
('recruiter_ownership', 'Decision-Making', 'What happens if a hiring decision turns out to be incorrect?'),
('recruiter_ownership', 'Decision-Making', 'How do you ensure follow-through after a hiring decision is made?'),
('recruiter_ownership', 'Decision-Making', 'What signals internally that a decision must be made quickly?'),
('recruiter_ownership', 'Decision-Making', 'How does your company balance speed and thoroughness in decision-making?'),
('recruiter_ownership', 'Decision-Making', 'Who is responsible for communicating the final outcome to candidates?'),
('recruiter_ownership', 'Decision-Making', 'How do you track accountability for hiring outcomes?'),
('recruiter_ownership', 'Decision-Making', 'What escalation process exists if hiring stalls?'),
('recruiter_ownership', 'Decision-Making', 'How transparent is the decision-making chain in your organization?'),
('recruiter_ownership', 'Decision-Making', 'How do you define ownership within your company culture?'),
('recruiter_ownership', 'Decision-Making', 'What distinguishes a decisive leader in your organization?'),
('recruiter_ownership', 'Decision-Making', 'How are responsibilities clearly assigned during hiring?'),
('recruiter_ownership', 'Decision-Making', 'How do you prevent responsibility from becoming diffused across teams?'),
('recruiter_ownership', 'Decision-Making', 'What role does data play in your hiring decisions?'),
('recruiter_ownership', 'Decision-Making', 'How does your company handle risk when making hiring choices?'),
('recruiter_ownership', 'Decision-Making', 'What internal metric defines a successful hiring decision?'),
('recruiter_ownership', 'Decision-Making', 'How do you ensure alignment between leadership and hiring decisions?'),
('recruiter_ownership', 'Decision-Making', 'When a difficult hiring call must be made, what principle guides the final decision?');

