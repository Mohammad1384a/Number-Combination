-- Items: stores master items like 'A1','B2',...
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(16) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- combinations: stores one combination row per set, grouped by response_id
-- A normalized design: combinations table stores a unique combination_id
CREATE TABLE IF NOT EXISTS combinations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  response_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS combination_items (
  combination_id BIGINT NOT NULL,
  item_id INT NOT NULL,
  pos INT NOT NULL, -- keep deterministic order
  PRIMARY KEY (combination_id, pos),
  CONSTRAINT fk_ci_comb FOREIGN KEY (combination_id) REFERENCES combinations(id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- responses: stores the server response object returned to client
CREATE TABLE IF NOT EXISTS responses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payload_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
