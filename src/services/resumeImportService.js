import Joi from 'joi';
import { generateText } from './aiService.js';
import { renderPrompt } from './promptLibraryService.js';
import * as userProfileService from './userProfileService.js';
import * as experienceService from './experienceService.js';
import * as educationService from './educationService.js';
import * as projectService from './projectService.js';
import { extractDocumentText } from './documentParsingService.js';

export const RESUME_SECTIONS = [
    'basics',
    'summary',
    'skills',
    'experience',
    'education',
    'projects',
    'socialLinks'
];

const outputSchema = {
    type: 'object',
    properties: {
        basics: {
            type: 'object',
            properties: {
                displayName: { type: 'string' },
                email: { type: 'string' },
                occupation: { type: 'string' }
            },
            required: ['displayName', 'email', 'occupation']
        },
        summary: { type: 'string' },
        skills: { type: 'array', items: { type: 'string' } },
        expertise: { type: 'array', items: { type: 'string' } },
        experience: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    company: { type: 'string' },
                    location: { type: 'string' },
                    roles: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                title: { type: 'string' },
                                startDate: { type: 'string' },
                                endDate: { type: 'string' },
                                description: { type: 'string' },
                                employmentType: { type: 'string' }
                            },
                            required: ['title', 'startDate', 'endDate', 'description', 'employmentType']
                        }
                    }
                },
                required: ['company', 'location', 'roles']
            }
        },
        education: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    school: { type: 'string' },
                    degree: { type: 'string' },
                    fieldOfStudy: { type: 'string' },
                    startDate: { type: 'string' },
                    endDate: { type: 'string' },
                    description: { type: 'string' }
                },
                required: ['school', 'degree', 'fieldOfStudy', 'startDate', 'endDate', 'description']
            }
        },
        projects: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    link: { type: 'string' },
                    skills: { type: 'array', items: { type: 'string' } }
                },
                required: ['title', 'description', 'link', 'skills']
            }
        },
        socialLinks: {
            type: 'object',
            properties: {
                linkedin: { type: 'string' },
                github: { type: 'string' },
                twitter: { type: 'string' },
                website: { type: 'string' }
            },
            required: ['linkedin', 'github', 'twitter', 'website']
        }
    },
    required: ['basics', 'summary', 'skills', 'expertise', 'experience', 'education', 'projects', 'socialLinks']
};

const text = (value, max = 10000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const strings = (value, maxItems = 100) => Array.isArray(value)
    ? [...new Set(value.map((item) => text(item, 160)).filter(Boolean))].slice(0, maxItems)
    : [];

export function normalizeSections(input) {
    const requested = Array.isArray(input) ? input : String(input || '').split(',');
    const sections = [...new Set(requested.map((item) => String(item).trim()).filter((item) => RESUME_SECTIONS.includes(item)))];
    if (!sections.length) throw new Error('Choose at least one resume section to extract');
    return sections;
}

export async function extractResumeText(file) {
    if (!file?.buffer) throw new Error('A resume file is required');
    return extractDocumentText(file, { maxCharacters: 50000 });
}

export function normalizePreview(raw, selectedSections = RESUME_SECTIONS) {
    const selected = new Set(selectedSections);
    const normalized = {
        basics: {
            displayName: text(raw?.basics?.displayName, 80),
            email: text(raw?.basics?.email, 200),
            occupation: text(raw?.basics?.occupation, 160)
        },
        summary: text(raw?.summary),
        skills: strings(raw?.skills),
        expertise: strings(raw?.expertise),
        experience: Array.isArray(raw?.experience) ? raw.experience.map((item) => ({
            company: text(item?.company, 200),
            location: text(item?.location, 200),
            roles: Array.isArray(item?.roles) ? item.roles.map((role) => ({
                title: text(role?.title, 200),
                startDate: text(role?.startDate, 80),
                endDate: text(role?.endDate, 80),
                description: text(role?.description),
                employmentType: text(role?.employmentType, 100)
            })).filter((role) => role.title) : []
        })).filter((item) => item.company && item.roles.length) : [],
        education: Array.isArray(raw?.education) ? raw.education.map((item) => ({
            school: text(item?.school, 200),
            degree: text(item?.degree, 200),
            fieldOfStudy: text(item?.fieldOfStudy, 200),
            startDate: text(item?.startDate, 80),
            endDate: text(item?.endDate, 80),
            description: text(item?.description)
        })).filter((item) => item.school && item.degree) : [],
        projects: Array.isArray(raw?.projects) ? raw.projects.map((item) => ({
            title: text(item?.title, 200),
            description: text(item?.description),
            link: text(item?.link, 500),
            skills: strings(item?.skills, 30)
        })).filter((item) => item.title) : [],
        socialLinks: {
            linkedin: text(raw?.socialLinks?.linkedin, 500),
            github: text(raw?.socialLinks?.github, 500),
            twitter: text(raw?.socialLinks?.twitter, 500),
            website: text(raw?.socialLinks?.website, 500)
        }
    };

    for (const section of RESUME_SECTIONS) {
        if (selected.has(section)) continue;
        if (['experience', 'education', 'projects', 'skills'].includes(section)) normalized[section] = [];
        else if (section === 'summary') normalized.summary = '';
        else if (section === 'basics') normalized.basics = {};
        else if (section === 'socialLinks') normalized.socialLinks = {};
    }
    if (!selected.has('skills')) normalized.expertise = [];
    return normalized;
}

export async function previewResume(file, requestedSections) {
    const sections = normalizeSections(requestedSections);
    const resumeText = await extractResumeText(file);
    const prompt = await renderPrompt('resume.selective-extraction', {
        requestedSections: sections.join(', '),
        resumeText
    });
    const result = await generateText(prompt, {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseJsonSchema: outputSchema
    });
    let parsed;
    try {
        parsed = JSON.parse(result.text);
    } catch {
        throw new Error('The resume extractor returned an invalid response. Please try again.');
    }
    return { sections, data: normalizePreview(parsed, sections) };
}

const applySchema = Joi.object({
    profile: Joi.object({
        displayName: Joi.string().min(2).max(80),
        email: Joi.string().email(),
        occupation: Joi.string().max(160).allow(''),
        bio: Joi.string().max(10000).allow(''),
        skills: Joi.array().items(Joi.string().max(160)).max(100),
        expertise: Joi.array().items(Joi.string().max(160)).max(100),
        socialLinks: Joi.object({
            linkedin: Joi.string().uri().allow(''),
            github: Joi.string().uri().allow(''),
            twitter: Joi.string().uri().allow(''),
            website: Joi.string().uri().allow('')
        }).min(1)
    }).min(1),
    experience: Joi.array().items(Joi.object({
        company: Joi.string().max(200).required(),
        location: Joi.string().max(200).allow(''),
        roles: Joi.array().items(Joi.object({
            title: Joi.string().max(200).required(),
            startDate: Joi.string().max(80).allow(''),
            endDate: Joi.string().max(80).allow(''),
            description: Joi.string().max(10000).allow(''),
            employmentType: Joi.string().max(100).allow('')
        })).min(1).required()
    })).max(50),
    education: Joi.array().items(Joi.object({
        school: Joi.string().max(200).required(),
        degree: Joi.string().max(200).required(),
        fieldOfStudy: Joi.string().max(200).allow(''),
        startDate: Joi.string().max(80).allow(''),
        endDate: Joi.string().max(80).allow(''),
        description: Joi.string().max(10000).allow('')
    })).max(50),
    projects: Joi.array().items(Joi.object({
        title: Joi.string().max(200).required(),
        description: Joi.string().max(10000).allow(''),
        link: Joi.string().uri().allow(''),
        skills: Joi.array().items(Joi.string().max(160)).max(30)
    })).max(50)
}).min(1);

const key = (...values) => values.map((value) => text(value).toLowerCase()).join('|');

export async function applyResumeImport(userId, payload) {
    const { value, error } = applySchema.validate(payload, { abortEarly: false, stripUnknown: true });
    if (error) throw new Error(error.details.map((detail) => detail.message).join(', '));

    const [profile, existingExperience, existingEducation, existingProjects] = await Promise.all([
        userProfileService.getMe(userId),
        experienceService.getUserExperiences(userId),
        educationService.getUserEducation(userId),
        projectService.getUserProjects(userId)
    ]);

    const profileUpdates = { ...(value.profile || {}) };
    if (profileUpdates.skills) profileUpdates.skills = strings([...(profile?.skills || []), ...profileUpdates.skills]);
    if (profileUpdates.expertise) profileUpdates.expertise = strings([...(profile?.expertise || []), ...profileUpdates.expertise]);
    if (profileUpdates.socialLinks) {
        profileUpdates.socialLinks = { ...(profile?.socialLinks || {}), ...profileUpdates.socialLinks };
    }
    if (Object.keys(profileUpdates).length) await userProfileService.updateUser(userId, profileUpdates);

    const experienceKeys = new Set(existingExperience.map((item) => key(item.company, item.roles?.[0]?.title)));
    const educationKeys = new Set(existingEducation.map((item) => key(item.school, item.degree)));
    const projectKeys = new Set(existingProjects.map((item) => key(item.title)));
    const created = { experience: 0, education: 0, projects: 0 };
    const skipped = { experience: 0, education: 0, projects: 0 };

    for (const item of value.experience || []) {
        const itemKey = key(item.company, item.roles?.[0]?.title);
        if (experienceKeys.has(itemKey)) { skipped.experience += 1; continue; }
        await experienceService.createExperience(userId, item);
        experienceKeys.add(itemKey);
        created.experience += 1;
    }
    for (const item of value.education || []) {
        const itemKey = key(item.school, item.degree);
        if (educationKeys.has(itemKey)) { skipped.education += 1; continue; }
        await educationService.createEducation(userId, item);
        educationKeys.add(itemKey);
        created.education += 1;
    }
    for (const item of value.projects || []) {
        const itemKey = key(item.title);
        if (projectKeys.has(itemKey)) { skipped.projects += 1; continue; }
        await projectService.createProject(userId, item);
        projectKeys.add(itemKey);
        created.projects += 1;
    }

    return { profileUpdated: Object.keys(profileUpdates).length > 0, created, skipped };
}
