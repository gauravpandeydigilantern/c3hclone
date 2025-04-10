import JobSkillList from "../components/job-skills";
import JobTypeList from "../components/job-types";
// import JobCategoryList from "../components/JobCategoryList";
import Jobs from "../components/jobs";
import Layout from "../components/Layout";
import TagList from "../components/tags";


export default function JobsPostPage() {
  return (
    <Layout>
      <div className="flex h-screen bg-gray-50">
      <div className="w-3/4 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Job Listings</h1>
        <div className="bg-white shadow-md rounded-lg p-4">
        <Jobs />
        </div>
      </div>
      <div className="w-1/4 p-6 bg-white border-l shadow-md overflow-auto">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Filters</h3>
        <div className="space-y-6">
        {/* <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <JobCategoryList />
        </div> */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <JobSkillList />
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <JobTypeList />
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <TagList />
        </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}