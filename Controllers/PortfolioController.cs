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
            projects = JsonConvert.DeserializeObject<List<ProjectModel>>(System.IO.File.ReadAllText("Content/Portfolio/portfolio.json"));

            foreach (ProjectModel project in projects) {
                project.mdcontent = System.IO.File.ReadAllText(string.Format("Content/Portfolio/{0}.md", project.shortname));
            }

            projects.Sort((projA, projB) => {
                return int.Parse(projB.startyear) - int.Parse(projA.startyear);
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
