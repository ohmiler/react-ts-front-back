import { Project } from './Project'
const baseUrl = "https://projects-data-api.vercel.app"
const url = `${baseUrl}/projects`

function translateStatusToErrorMessage(status: number) {
    switch(status) {
        case 401:
            return "Please login again.";
        case 403:
            return "You do not have permission to view the project(s).";
        default:
            return "There was an error retrieving the project(s). Please try again"
    }
}

function checkStatus(response: any) {
    if (response.ok) {
        return response;
    } else {
        const httpErrorInfo = {
            status: response.status,
            statusText: response.statusText,
            url: response.url
        }
        console.log(`log server http error: ${JSON.stringify(httpErrorInfo)}`);

        let errorMessage = translateStatusToErrorMessage(httpErrorInfo.status);
        throw new Error(errorMessage);
    }
}

function parseJSON(response: Response) {
    return response.json();
}

// function delay(ms: number) {
//     return function(x: any): Promise<any> {
//         return new Promise((resolve) => setTimeout(() => resolve(x), ms));
//     }
// }

function convertToProjectModels(data: any[]): Project[] {
    let projects: Project[] = data.map(convertToProjectModel);
    return projects;
}

function convertToProjectModel(item: any): Project {
    return new Project(item);
}

const projectAPI = {
    get(page = 1, limit = 20) {
        return fetch(`${url}?_page=${page}&_limit=${limit}&_sort=name`)
                    .then(checkStatus)
                    .then(parseJSON)
                    .then(convertToProjectModels)
                    .catch((error: TypeError) => {
                        console.log('log client error ' + error);
                        throw new Error(
                            'There was an error retrieving the projects. please try again.'
                        )
                    })
    },
    put(project: Project) {
        return fetch(`${url}/${project.id}`, {
            method: "PUT",
            body: JSON.stringify(project),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(checkStatus)
        .then(parseJSON)
        .catch((error: TypeError) => {
            console.log('log client error ' + error);
            throw new Error(
                'There was an error updating the project. Please try again.'
            )
        })
    },
    find(id: number) {
        return fetch(`${url}/${id}`)
                .then(checkStatus)
                .then(parseJSON)
                .then(convertToProjectModel)
    }
}

export { projectAPI };
