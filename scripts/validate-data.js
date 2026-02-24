const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

const projectRoot = path.resolve(__dirname, "..");

const specs = [
  {
    label: "Sermons",
    dataPath: "assets/data/sermons.json",
    schemaPath: "schemas/sermons.schema.json",
    dateField: "date",
    idField: "id"
  },
  {
    label: "Events",
    dataPath: "assets/data/events.json",
    schemaPath: "schemas/events.schema.json",
    dateField: "dateTime",
    idField: "id"
  }
];

const ajv = new Ajv({ allErrors: true, strict: true });

function readJson(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const raw = fs.readFileSync(absolutePath, "utf8");
  return JSON.parse(raw);
}

function formatAjvError(error) {
  const instancePath = error.instancePath || "(root)";
  return `${instancePath} ${error.message}`;
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidDateTime(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}Z`);
  return !Number.isNaN(date.getTime());
}

function validateUniqueness(rows, idField) {
  const seen = new Set();
  const duplicates = [];

  rows.forEach((row) => {
    const id = row?.[idField];
    if (seen.has(id)) {
      duplicates.push(id);
      return;
    }

    seen.add(id);
  });

  return duplicates;
}

function run() {
  let hasFailures = false;

  specs.forEach((spec) => {
    const schema = readJson(spec.schemaPath);
    const data = readJson(spec.dataPath);
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      hasFailures = true;
      console.error(`\n[${spec.label}] schema validation failed for ${spec.dataPath}`);
      validate.errors.forEach((error) => {
        console.error(`- ${formatAjvError(error)}`);
      });
      return;
    }

    const duplicates = validateUniqueness(data, spec.idField);
    if (duplicates.length) {
      hasFailures = true;
      console.error(`\n[${spec.label}] duplicate IDs in ${spec.dataPath}: ${duplicates.join(", ")}`);
    }

    const invalidDates = data
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => {
        if (spec.dateField === "date") {
          return !isValidDate(row[spec.dateField]);
        }

        return !isValidDateTime(row[spec.dateField]);
      });

    if (invalidDates.length) {
      hasFailures = true;
      console.error(`\n[${spec.label}] invalid ${spec.dateField} values in ${spec.dataPath}`);
      invalidDates.forEach(({ row, index }) => {
        console.error(`- index ${index}: ${row[spec.dateField]}`);
      });
    }

    if (!duplicates.length && !invalidDates.length) {
      console.log(`[${spec.label}] ${spec.dataPath} passed`);
    }
  });

  if (hasFailures) {
    console.error("\nData validation failed.");
    process.exit(1);
  }

  console.log("\nAll data files passed validation.");
}

try {
  run();
} catch (error) {
  console.error("Validation runner failed:", error.message);
  process.exit(1);
}
