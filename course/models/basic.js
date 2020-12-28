const { Pool } = require('pg');

const { Sequelize, Model, DataTypes, Deferrable } = require('sequelize');
const moment = require('moment');

const sequelize = new Sequelize('postgres://postgres:522@localhost:5432/course', { logging: false });

const pool = new Pool({
	user: 'postgres',
	password: '522',
	host: 'localhost',
	port: 5432,
	database: 'course',
});

class Author extends Model {
	async create(item) {
		await Author.create(item);
	}
	async delete(itemId) {
		await Author.destroy({ where: { id: itemId } });
	}
	async update(updatedItem, itemId) {
		await Author.update(updatedItem, { where: { id: itemId } });
	}
}
Author.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(30),
			allowNull: false,
		},
		age: DataTypes.INTEGER,
		email: {
			type: DataTypes.STRING(50),
			allowNull: false,
		},
	},
	{
		modelName: 'Author',
		tableName: 'authors',
		timestamps: false,
		sequelize,
	}
);

class News extends Model {
	async create(item) {
		await News.create(item);
	}
	async delete(itemId) {
		await News.destroy({ where: { id: itemId } });
	}
	async update(updatedItem, itemId) {
		await News.update(updatedItem, { where: { id: itemId } });
	}
}
News.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		title: {
			type: DataTypes.STRING(200),
			allowNull: false,
		},
		content: DataTypes.TEXT,
		publication_date: DataTypes.DATEONLY,
		author_id: {
			type: DataTypes.INTEGER,

			references: {
				model: Author,
				key: 'id',
				deferrable: Deferrable.INITIALLY_IMMEDIAT,
			},
		},
		likes: DataTypes.INTEGER,
		views: DataTypes.INTEGER,
	},
	{
		modelName: 'News',
		tableName: 'news',
		timestamps: false,
		sequelize,
	}
);

class Category extends Model {
	async create(item) {
		await Category.create(item);
	}
	async delete(itemId) {
		await Category.destroy({ where: { id: itemId } });
	}
	async update(updatedItem, itemId) {
		await Category.update(updatedItem, { where: { id: itemId } });
	}
}
Category.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: DataTypes.STRING(15),
			allowNull: false,
		},
		description: DataTypes.TEXT,
	},
	{
		modelName: 'Category',
		tableName: 'categories',
		timestamps: false,
		sequelize,
	}
);

class CategoryNewsLinks extends Model {
	async create(item) {
		await CategoryNewsLinks.create(item);
	}
	async delete(itemId) {
		await CategoryNewsLinks.destroy({ where: { id: itemId } });
	}
	async update(updatedItem, itemId) {
		await CategoryNewsLinks.update(updatedItem, { where: { id: itemId } });
	}
}
CategoryNewsLinks.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		news_id: {
			type: DataTypes.INTEGER,

			references: {
				model: News,
				key: 'id',
				deferrable: Deferrable.INITIALLY_IMMEDIAT,
			},
		},
		category_id: {
			type: DataTypes.INTEGER,

			references: {
				model: Category,
				key: 'id',
				deferrable: Deferrable.INITIALLY_IMMEDIAT,
			},
		},
	},
	{
		modelName: 'CategoryNewsLinks',
		tableName: 'category_news_links',
		timestamps: false,
		sequelize,
	}
);

class BasicModel {
	async connection() {
		try {
			await sequelize.authenticate();
			console.log('Connection has been established successfully.');
			await sequelize.sync();
		} catch (error) {
			console.error('Unable to connect to the database:', error);
		}
	}

	async getItems(tableName) {
		try {
			const { rows } = await pool.query(`SELECT * FROM ${tableName}`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async insertItem(tableName, itemColumns, itemValues) {
		const items = {};
		itemColumns.forEach((item, i) => {
			items[item] = itemValues[i];
		});

		const classMap = new Map();
		classMap.set('authors', new Author().create);
		classMap.set('news', new News().create);
		classMap.set('categories', new Category().create);
		classMap.set('category_news_links', new CategoryNewsLinks().create);
		const createFoo = classMap.get(tableName);
		try {
			await createFoo(items);
		} catch (err) {
			throw err;
		}
	}

	async deleteItem(tableName, itemId) {
		const classMap = new Map();
		classMap.set('authors', new Author().delete);
		classMap.set('news', new News().delete);
		classMap.set('categories', new Category().delete);
		classMap.set('category_news_links', new CategoryNewsLinks().delete);
		const deleteFoo = classMap.get(tableName);
		try {
			await deleteFoo(itemId);
		} catch (err) {
			throw err;
		}
	}

	async updateItem(tableName, updatedItem, itemId) {
		const classMap = new Map();
		classMap.set('authors', new Author().update);
		classMap.set('news', new News().update);
		classMap.set('categories', new Category().update);
		classMap.set('category_news_links', new CategoryNewsLinks().update);
		const updateFoo = classMap.get(tableName);

		try {
			await updateFoo(updatedItem, itemId);
		} catch (err) {
			throw err;
		}
	}

	async checkOnSubordinates(subordinateTableName, foreignKeyField, itemId) {
		try {
			const { rows } = await pool.query(`SELECT count(*) FROM ${subordinateTableName} WHERE ${foreignKeyField} = ${itemId}`);
			return +rows[0].count;
		} catch (err) {
			throw err;
		}
	}

	async getItem(tableName, itemId) {
		try {
			const { rows } = await pool.query(`SELECT * FROM ${tableName} WHERE id = ${itemId}`);
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
			const { rows } = await pool.query(`SELECT column_name as column FROM information_schema.columns WHERE table_name='${tableName}'`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async getNumOfColumns(tableName) {
		try {
			const { rows } = await pool.query(`SELECT count(column_name) as numOfColumns FROM information_schema.columns WHERE table_name='${tableName}`);
			return rows;
		} catch (err) {
			throw err;
		}
	}

	async checkForParent(tableName, itemId) {
		try {
			const { rows } = await pool.query(`SELECT count(*) FROM ${tableName} WHERE id = ${itemId}`);
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
				`INSERT INTO news(title, content, publication_date, author_id, likes, views) SELECT random_string(trunc(random()*10+5)::int), 
				random_text(trunc(random()*10+5)::int, trunc(random()*15+5)::int),
				timestamp '2020-01-10 20:00:00' +
					   random() * (timestamp '2019-01-20 20:00:00' -
								   timestamp '2020-01-10 10:00:00'), 
				trunc(random()*(SELECT MAX(id) FROM "authors")+(SELECT MIN(id) FROM "authors")),
				trunc(random()*90+5::int),
				trunc(random()*90+5::int)
				FROM generate_series(1,${num});`
			);
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

	async sortByLikes(category, countdownDate) {
		try {
			const dateTo = moment().format('YYYY-MM-DD');

			if (category) {
				const {
					rows,
				} = await pool.query(`select news_id, name as category_name, title as news_title, publication_date, likes, views from category_news_links
					join news on news_id = news.id
					join categories on category_id = categories.id
					where categories.name like '${category || '%'}' and publication_date between '${countdownDate}' and '${dateTo}'
					order by likes desc`);
				return rows;
			} else {
				const { rows } = await pool.query(`select id, title as news_title, publication_date, likes, views from news
					order by likes desc`);
				return rows;
			}
		} catch (err) {
			throw err;
		}
	}

	async sortByViews(category, countdownDate) {
		try {
			const dateTo = moment().format('YYYY-MM-DD');

			if (category) {
				const {
					rows,
				} = await pool.query(`select news_id, name as category_name, title as news_title, publication_date, likes, views from category_news_links
					join news on news_id = news.id
					join categories on category_id = categories.id
					where categories.name like '${category || '%'}' and publication_date between '${countdownDate}' and '${dateTo}'
					order by views desc`);
				return rows;
			} else {
				const { rows } = await pool.query(`select id, title as news_title, publication_date, likes, views from news
					order by views desc`);
				return rows;
			}
		} catch (err) {
			throw err;
		}
	}

	async end() {
		await pool.end();
		await sequelize.close();
	}
}

module.exports = BasicModel;
