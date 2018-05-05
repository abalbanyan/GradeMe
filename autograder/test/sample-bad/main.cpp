#include "employee.hpp"
#include "payroll.hpp"

int main() {
  TaxTable tt = {
    {0, 0.05},
    {10000, 0.1},
    {40000, 0.15},
    {80000, 0.20},
    {100000, 0.25},
    {200000, 0.30}
  };

  #error "artificial compliation failure in main()"

  Payroll payroll(1000000, tt);
  payroll.add_employee(Employee("Vivian Lee", "Physical Therapist", "Health", 100000));
  payroll.add_employee(Employee("Julia Tse", "Biological Systems Engineer", "Engineering", 100000));
  payroll.add_employee(Employee("Danielle Meyers", "Veterinarian", "Animal Health", 100000));
  payroll.add_employee(Employee("Nigel Pasman", "Physicist", "Engineering", 100000));
  payroll.add_employee(Employee("Jane Karneyenka", "Software Engineer", "Engineering", 100000));
  payroll.add_employee(Employee("Michael Pearson", "Software Engineer", "Engineering", 100000));

  Employee& e = payroll.find_employee("Michael Pearson");
  std::cout << e.getJob() << std::endl;
}
