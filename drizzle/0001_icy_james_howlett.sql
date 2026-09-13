CREATE INDEX `idx_claim_dependencies_claim_id` ON `claim_dependencies` (`claim_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_claim_dependencies_pair` ON `claim_dependencies` (`claim_id`,`dependency_id`);--> statement-breakpoint
CREATE INDEX `idx_claims_updated_at` ON `claims` (`updated_at`);