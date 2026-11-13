<?php
// Settings for the website assistant (api/chat.php).
//
// 1. Copy this file to "config.php" in the same folder.
// 2. Paste the Anthropic API key between the quotes below (create one at https://platform.claude.com/).
// 3. Upload config.php to the server. Never share it or commit it to a public repository.
//
// Until config.php exists, the chat panel still works: it answers from the website text by itself.

return [
    'api_key' => '',                    // e.g. 'sk-ant-...'

    // Optional. Remove the two slashes in front of a line to change its default.
    // 'model'        => 'claude-opus-5-5',   // the model that writes the answers
    // 'effort'       => 'low',               // 'low' is right for short factual answers
    // 'per_ip_limit' => 20,                  // questions one visitor may ask in ten minutes
    // 'daily_limit'  => 1500,                // questions per day for the whole site
];
