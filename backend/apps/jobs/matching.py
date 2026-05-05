import math

from apps.jobs.models import JobSkillRequirement


def _vector_magnitude(values):
    return math.sqrt(sum(value * value for value in values))


def calculate_job_match(seeker_profile, job):
    seeker_skills = {
        item.skill_id: float(item.proficiency)
        for item in seeker_profile.skills.select_related("skill")
    }
    requirements = list(job.requirements.select_related("skill"))
    if not seeker_skills or not requirements:
        return 0.0

    job_vector = {}
    for requirement in requirements:
        importance_multiplier = (
            1.8 if requirement.importance == JobSkillRequirement.Importance.REQUIRED else 1.0
        )
        job_vector[requirement.skill_id] = float(requirement.minimum_proficiency) * importance_multiplier * max(
            requirement.weight,
            0.5,
        )

    keys = set(seeker_skills) | set(job_vector)
    dot_product = sum(seeker_skills.get(key, 0.0) * job_vector.get(key, 0.0) for key in keys)
    seeker_magnitude = _vector_magnitude(seeker_skills.values())
    job_magnitude = _vector_magnitude(job_vector.values())
    if not seeker_magnitude or not job_magnitude:
        return 0.0
    return round((dot_product / (seeker_magnitude * job_magnitude)) * 100, 2)


def build_skill_gap_summary(seeker_profile, job):
    seeker_skills = {
        item.skill_id: item.proficiency
        for item in seeker_profile.skills.select_related("skill")
    }
    gaps = []
    for requirement in job.requirements.select_related("skill").prefetch_related("skill__resources"):
        seeker_level = seeker_skills.get(requirement.skill_id, 0)
        if seeker_level >= requirement.minimum_proficiency:
            continue
        gaps.append(
            {
                "skill": requirement.skill.name,
                "importance": requirement.importance,
                "required_level": requirement.minimum_proficiency,
                "your_level": seeker_level,
                "resources": [
                    {
                        "title": resource.title,
                        "url": resource.url,
                        "provider": resource.provider,
                    }
                    for resource in requirement.skill.resources.all()
                ],
            }
        )
    return gaps
