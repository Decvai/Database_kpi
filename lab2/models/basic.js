const { Pool } = require('pg');

const pool = new Pool({
	user: 'postgres',
	password: '522',
	host: 'localhost',
	port: 5432,
	database: 'kpi',
});

class BasicModel {
	async getItems(tableName) {
		try {
			const { rows } = await pool.query(`SELECT * FROM ${tableName}`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async insertItem(tableName, itemColumns, itemValues) {
		try {
			const columns = itemColumns.join(',');
			const values = itemValues.join(`', '`);
			await pool.query(
				`INSERT INTO ${tableName} (${columns}) VALUES ('${values}')`
			);
		} catch (err) {
			throw err;
		}
	}

	async deleteItem(tableName, itemId) {
		try {
			await pool.query(`DELETE FROM ${tableName} WHERE id = ${itemId}`);
		} catch (err) {
			throw err;
		}
	}

	async updateItem(tableName, updatedItem, itemId) {
		const itemKeys = Object.keys(updatedItem);
		const itemValues = Object.values(updatedItem);
		const columns = itemKeys.join(',');
		const values = itemValues.join(`', '`);
		console.log(
			`UPDATE ${tableName} SET (${columns}) = ROW('${values}') WHERE id = ${itemId}`
		);
		try {
			await pool.query(
				`UPDATE ${tableName} SET (${columns}) = ROW('${values}') WHERE id = ${itemId}`
			);
		} catch (err) {
			throw err;
		}
	}

	async checkOnSubordinates(subordinateTableName, foreignKeyField, itemId) {
		try {
			const { rows } = await pool.query(
				`SELECT count(*) FROM ${subordinateTableName} WHERE ${foreignKeyField} = ${itemId}`
			);
			return +rows[0].count;
		} catch (err) {
			throw err;
		}
	}

	async getItem(tableName, itemId) {
		try {
			const { rows } = await pool.query(
				`SELECT * FROM ${tableName} WHERE id = ${itemId}`
			);
			return rows[0];
		} catch (err) {
			throw err;
		}
	}

	async getAllTableNames() {
		try {
			const { rows } = await pool.query(`SELECT table_name
			FROM information_schema.tables
		   WHERE table_schema='public'
			 AND table_type='BASE TABLE';`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async listOfFk(tableName) {
		try {
			const { rows } = await pool.query(`SELECT
			kcu.column_name, 
			ccu.table_name AS foreign_table_name
		FROM 
			information_schema.table_constraints AS tc 
			JOIN information_schema.key_column_usage AS kcu
			  ON tc.constraint_name = kcu.constraint_name
			  AND tc.table_schema = kcu.table_schema
			JOIN information_schema.constraint_column_usage AS ccu
			  ON ccu.constraint_name = tc.constraint_name
			  AND ccu.table_schema = tc.table_schema
		WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='${tableName}';`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async getAllTableColumns(tableName) {
		try {
			const { rows } = await pool.query(
				`SELECT column_name as column FROM information_schema.columns WHERE table_name='${tableName}'`
			);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async getNumOfColumns(tableName) {
		try {
			const { rows } = await pool.query(
				`SELECT count(column_name) as numOfColumns FROM information_schema.columns WHERE table_name='${tableName}`
			);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async checkForParent(tableName, itemId) {
		try {
			const { rows } = await pool.query(
				`SELECT count(*) FROM ${tableName} WHERE id = ${itemId}`
			);
			return +rows[0].count;
		} catch (err) {
			throw err;
		}
	}

	async autogenerateCategories(num) {
		try {
			await pool.query(
				`INSERT INTO categories(name, description) SELECT random_string(trunc(random()*10+5)::int), 
				random_text(trunc(random()*10+5)::int, 
				trunc(random()*15+5)::int) FROM generate_series(1, ${num});`
			);
		} catch (err) {
			throw err;
		}
	}

	async autogenerateAuthors(num) {
		try {
			await pool.query(
				`INSERT INTO authors(name, age, email) 
				SELECT (array['John', 'Lucas', 'Ethan', 'Mason', 'Mia', 'Charlotte', 'Amelia'])[floor(random() * 3 + 1)], 
				trunc(random()*90+5::int), random_email() FROM generate_series(1,${num});`
			);
		} catch (err) {
			throw err;
		}
	}

	async autogenerateNews(num) {
		try {
			await pool.query(
				`INSERT INTO news(title, content, publication_date, author_id) SELECT random_string(trunc(random()*10+5)::int), 
				random_text(trunc(random()*10+5)::int, trunc(random()*15+5)::int),
				timestamp '2014-01-10 20:00:00' +
					   random() * (timestamp '2010-01-20 20:00:00' -
								   timestamp '2019-01-10 10:00:00'), 
				trunc(random()*(SELECT MAX(id) FROM "authors")+1)
				FROM generate_series(1,${num});`
			);
		} catch (err) {
			throw err;
		}
	}

	async searchFirstReq(itemName, itemAge, itemTitle) {
		try {
			const {
				rows,
			} = await pool.query(`SELECT authors.id, name, age, email, title, publication_date FROM authors 
			INNER JOIN news on author_id = authors.id 
			WHERE name LIKE '%${itemName}%' AND age BETWEEN ${itemAge.lower} AND ${itemAge.upper} AND title LIKE '%${itemTitle}%'`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async searchSecondReq(itemId, itemName, itemDate) {
		try {
			const {
				rows,
			} = await pool.query(`SELECT news_id, category_id, title, author_id, publication_date, name as category_name, name FROM news
			INNER JOIN news_category_links ncl ON news.id = ncl.news_id
			INNER JOIN categories ON ncl.category_id = categories.id
			WHERE news.id BETWEEN ${itemId.lower} AND ${itemId.upper} AND title LIKE '%${itemName}%' 
			AND publication_date BETWEEN '${itemDate.lower}' AND '${itemDate.upper}'`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async searchThirdReq(newsId, authorId, categoryName) {
		try {
			const {
				rows,
			} = await pool.query(`SELECT news_id, category_id, author_id, authors.name, authors.age, 
			title, publication_date, categories.name AS category_name FROM news 
			INNER JOIN news_category_links ncl ON news.id = ncl.news_id
			INNER JOIN categories ON ncl.category_id = categories.id
			INNER JOIN authors ON author_id = authors.id
			WHERE news.id BETWEEN ${newsId.lower} AND ${newsId.upper} AND authors.id 
			BETWEEN ${authorId.lower} AND ${authorId.upper} AND categories.name LIKE '%${categoryName}%';`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async getColumnType(tableName, columnName) {
		try {
			const { rows } = await pool.query(`SELECT DATA_TYPE 
			FROM INFORMATION_SCHEMA.COLUMNS
			WHERE 
				 TABLE_NAME = '${tableName}' AND 
				 COLUMN_NAME = '${columnName}'`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async end() {
		await pool.end();
	}
}

module.exports = BasicModel;
