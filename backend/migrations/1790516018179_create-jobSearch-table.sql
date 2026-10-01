
CREATE TABLE job_searches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid          UUID NOT NULL,
    resume_profile  JSONB NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_userid FOREIGN KEY (userid) REFERENCES users(id)
); 

CREATE TABLE ranked_jobs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_search_id  UUID NOT NULL,
    jobid          TEXT NOT NULL,
    title          TEXT NOT NULL,
    company        TEXT NOT NULL,
    location       TEXT NOT NULL,
    score          SMALLINT NOT NULL CHECK (score >= 0 AND score <= 100),
    match_reason   TEXT NOT NULL,
    url            TEXT NOT NULL,
    salary         TEXT,
    job_type       TEXT NOT NULL,
    posted_at      TEXT,

    CONSTRAINT fk_job_search FOREIGN KEY (job_search_id) REFERENCES job_searches(id) ON DELETE CASCADE
);

CREATE INDEX idx_job_searches_userid ON job_searches(userid);
CREATE INDEX idx_job_searches_userid_created ON job_searches(userid, created_at DESC);
CREATE INDEX idx_ranked_jobs_job_search_id ON ranked_jobs(job_search_id);



