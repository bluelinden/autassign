# Autassign
Autassign is the Google Apps Script tool used to assign website work to staff at The Verdict. It uses an algorithm that takes into account the staff's skills, the work's difficulty, and the staff's availability to assign work to staff. 

## Algorithm
The algorithm uses the following metrics to assign work:
- Staff member efficiency
- Work difficulty
- Staff member workload
- Specific staff member skills
- Type of job
- Staff member availability (herein referred to as the dogpile bias)

#### Staff member efficiency
The algorithm takes into account the staff member's efficiency. If a staff member has a high efficiency, they are a little more likely to be assigned work. If a staff member has a low efficiency, they are less likely to be assigned work. This has a tiny weight in the algorithm, so that workload and skill requirements ALWAYS take precedence. This allows new staff to "rise up" in the algorithm as they become more efficient. Efficiency only becomes a factor when a staff member's workload matches another's.

#### Work difficulty
The algorithm takes into account the difficulty of the work. If a job is marked as being difficult, it is much more likely to be assigned to a staff member that has a high skill level. If a job is marked as being easy, it is easier to be assigned to a staff member that has a low skill level, and so that metric will take precedence over workload.

#### Staff member workload
The algorithm takes into account the staff member's workload. If a staff member has a high workload, they are much less likely to be assigned work. If a staff member has a low workload, they are more likely to be assigned work. The algorithm gives staff members who have not worked on a run a 6x higher priority than staff members who have worked on a run. It's safe to say that unless a non-working user doesn't possess one of the required skills, they *will* be assigned the work.

#### Specific staff member skills
The algorithm takes into account the specific staff member's skills. If a staff member has a skill that is required for a job, they are much more likely to be assigned that job. In The Verdict's case, those are Web Layout, Web Technology, and Design. If an article is marked as having any of those, users that don't have those marked skills essentially get kicked out of first place.

#### Type of job
The algorithm categorizes jobs, at The Verdict those are Transfer, Art, Verify and Publish. Staff that can't transfer have their score nuked if the job is marked as "Transfer," so that people with insufficient permissions or rank don't get assigned work they can't do. The same goes for Art, Verify, and Publish. If a staff member can't do a job, they will and should never be assigned that job.

#### Staff member availability
The dogpile bias prevents people with other responsibilities from being overloaded with work. The higher their dogpile score is, the lower their final score is. For example, our editor-in-chief should technically be able to publish articles, but it's not their *job.* They should never be picked first. The dogpile number is subtracted from the jobScore metric.

### Calculation
On every assign operation, the algorithm is given the full article data, the job being assigned, the full list of staff, and the full list of currently assigned tasks for the run.

#### Job score
`user.jobScore = 1 - ((user.jobCount * 6) / jobs.jobCount) - (user.dogPile/100);`

* user.jobcount is the number of jobs the user has that run
* jobs.jobCount is the total number of jobs that run
* user.dogPile is the user's dogpile score

#### Difficulty score
`user.diffScore = (user.skill / 100) - (article.diff.number / 15);`

* user.skill is the user's skill level, from 0 to 100
* article.diff.number is the difficulty of the article, from 0 to 3

#### Final score
`user.score = 100 * (user.jobScore + (0.08 * user.diffScore));`

The job score has a much higher weight than the difficulty score. This is so that new staff members that haven't done as much work can improve. This score only really matters if two users have the same workload.

If a user doesn't have a skill needed for an article, like tech, design or layout, 30 points are subtracted from their score.

If the user is incapable of doing the job because they don't have the right permissions, their score is set impossibly low, to -32767. This makes it obvious to users that they can't do the job.

The final score is whatever all of that makes it, rounded to the nearest tenth. Negative scores just mean you reeeeeally shouldn't be assigning the job to someone.

# No support can be provided for this because it is exclusively deployed on Apps Script and is only used by The Verdict internally. This repository is only here for transparency and to allow other publications to use it as a reference.