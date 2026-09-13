CREATE TABLE `claim_dependencies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`claim_id` text NOT NULL,
	`dependency_id` text NOT NULL,
	FOREIGN KEY (`claim_id`) REFERENCES `claims`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`dependency_id`) REFERENCES `claims`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`statement` text NOT NULL,
	`status` text DEFAULT 'incomplete' NOT NULL,
	`kind` text DEFAULT 'Claim' NOT NULL,
	`risk` text DEFAULT 'Not yet reviewed.' NOT NULL,
	`evidence` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
