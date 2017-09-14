using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using michaeledavies.Models;

namespace michaeledavies.Controllers
{
    public class PortfolioController : Controller
    {
        List<ProjectModel> projects;

        public PortfolioController() {
            LoadAllContent();
        }

        private void LoadAllContent() {
            projects = JsonConvert.DeserializeObject<List<ProjectModel>>(System.IO.File.ReadAllText("wwwroot/content/portfolio/portfolio.json"));

            foreach (ProjectModel project in projects) {
                project.mdcontent = System.IO.File.ReadAllText(string.Format("wwwroot/content/portfolio/{0}.md", project.shortname));
            }

            projects.Sort((projA, projB) => {
                double yearA = double.Parse(projA.startyear) 
                    + double.Parse(projA.endyear) / 2.0;

                double yearB = double.Parse(projB.startyear) 
                    + double.Parse(projB.endyear) / 2.0;
                
                if (yearA > yearB) {
                    return -1;
                }
                else if (yearA < yearB) {
                    return 1;
                }
                
                return 0;
            });
        }

        public IActionResult Index()
        {
            return View(projects);
        }

        public IActionResult Project(string id)
        {
            return View();
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
