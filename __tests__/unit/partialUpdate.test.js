const sqlForPartialUpdate = require("../../helpers/partialUpdate");


describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {


    const { query, values } = sqlForPartialUpdate("jobs", {min_salary: 70000}, "id", 1);
    // const { query, values } = sqlForPartialUpdate(companies, {num_employees: 203}, handle, "target");
    expect(query).toEqual(`UPDATE jobs SET min_salary=$1 WHERE id=$2 RETURNING *`);
    expect(values).toEqual([70000, 1]);
  });
});
