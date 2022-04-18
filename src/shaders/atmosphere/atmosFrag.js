// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// Based on SimonDev and Sebastian Lague's work

const atmosFrag = /* glsl */ `    


// ################################################################
// ||                   VARIABLES & QUALIFIERS                   ||
// ################################################################    
    
    #define FLT_MAX 3.402823466e+38

    ////////////////////////////////////////////////////////////////////////////////
    
    in vec2 vUv;

    ////////////////////////////////////////////////////////////////////////////////

    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;

    uniform mat4 inverseProjection;
    uniform mat4 inverseView;

    uniform vec3 sunPosition;

    uniform vec3 planetPosition;
    uniform float planetRadius;

    uniform float atmosphereRadius;
    uniform float densityFalloff;
    uniform float opticalDepthPoints;
    uniform float inScatterPoints;
    uniform vec3  scatteringCoefficients;

    
// ################################################################
// ||                         FUNCTIONS                          ||
// ################################################################


    // Convert screen coordinates to world coordinates
    vec3 _ScreenToWorld(vec3 pos) {
        vec4 posP = vec4(pos.xyz * 2. - 1.0, 1.);
        vec4 posVS = inverseProjection * posP;
        vec4 posWS = inverseView * vec4((posVS.xyz / posVS.w), 1.0);

        return posWS.xyz;
    }

    
    // Returns vector (dstToSphere, dstThroughSphere)
	// If ray origin is inside sphere, dstToSphere = 0
	// If ray misses sphere, dstToSphere = maxValue; dstThroughSphere = 0
    vec2 raySphere(vec3 sphereCentre, float sphereRadius, vec3 rayOrigin, vec3 rayDir) {
        vec3 offset = rayOrigin - sphereCentre;
        float a = 1.0;
        // float a = dot(rayDir, rayDir); // If rayDir is not normalized
        float b = 2.0 * dot(offset, rayDir);
        float c = dot(offset, offset) - sphereRadius * sphereRadius;
        float d = b * b - 4.0 * a * c;

        // Number of intersections: 0 when d < 0, 1 when d = 0, 2 when d > 0
        if (d > 0.0) {
            float s = sqrt(d);
            float dstToSphereNear = max(0.0, (-b - s) / (2.0 * a));
            float dstToSphereFar = (-b + s) / (2.0 * a);

            // Ignore intersections behind the ray
            if (dstToSphereFar >= 0.0) {
                return vec2(dstToSphereNear, dstToSphereFar - dstToSphereNear);
            }
        }

        // Ray did not intersect the sphere
        return vec2(FLT_MAX, 0.0);
    }


    float densityAtPoint(vec3 densitySamplePoint) {
        float heightAboveSurface = length(densitySamplePoint - planetPosition) - planetRadius;
        float height01 = heightAboveSurface / (atmosphereRadius - planetRadius);
        float localDensity = exp(-height01 * densityFalloff) * (1.0 - height01);

        return localDensity;
    }


    // Calculates the average density of the atmosphere along a ray
    float opticalDepth(vec3 rayOrigin, vec3 rayDir, float rayLength) {
        vec3 densitySamplePoint = rayOrigin;
        float stepSize = rayLength / (opticalDepthPoints -1.0);
        float opticalDepth = 0.0;

        for (float i = 0.; i < opticalDepthPoints; i++) {
            float localDensity = densityAtPoint(densitySamplePoint);
            opticalDepth += localDensity * stepSize;
            densitySamplePoint += rayDir * stepSize;
        }

        return opticalDepth;
    }


    vec3 calculateLight(vec3 rayOrigin, vec3 rayDir, float rayLength, vec3 originalCol) {
        vec3 dirToSun = normalize(sunPosition);
        vec3 inScatterPoint = rayOrigin;
        float stepSize = rayLength / (inScatterPoints - 1.0);
        vec3 inScatteredLight = vec3(0.0);
        float viewRayOpticalDepth = 0.0;

        for (float i = 0.; i < inScatterPoints; i++) {
            // Ray to atmosphere
            float sunRayLength = raySphere(planetPosition, atmosphereRadius, inScatterPoint, dirToSun).y;
            float sunRayOpticalDepth = opticalDepth(inScatterPoint, dirToSun, sunRayLength);
            viewRayOpticalDepth = opticalDepth(inScatterPoint, -rayDir, stepSize * i);
            vec3 transmittance = exp(-(sunRayOpticalDepth + viewRayOpticalDepth) * scatteringCoefficients);
            float localDensity = densityAtPoint(inScatterPoint);

            inScatteredLight += localDensity * transmittance * scatteringCoefficients * stepSize;
            inScatterPoint += rayDir * stepSize;
        }
        float originalColTransmittance = exp(-viewRayOpticalDepth);
        return originalCol * originalColTransmittance + inScatteredLight;
    }


// ################################################################
// ||                           MAIN                             ||
// ################################################################


    void main() {
        // Get planet texture
        vec4 originalCol = texture(tDiffuse, vUv);
        gl_FragColor = originalCol;

        // Calculate world coordinates relative to screen
        float z = texture2D(tDepth, vUv).x;
        vec3 posWorldScreen = _ScreenToWorld(vec3(vUv, z));

        // Setup Raytrace origin and direction
        vec3 rayOrigin = cameraPosition;            
        vec3 rayDirection = normalize(posWorldScreen - cameraPosition);

        // Raytrace to the planet to get the distance
        float dstToSurface = raySphere(planetPosition, planetRadius, rayOrigin, rayDirection).x;

        // Raytrace to the atmosphere
        vec2 hitInfo = raySphere(planetPosition, atmosphereRadius, rayOrigin, rayDirection);
        float dstToAtmosphere = hitInfo.x;
        float dstThroughAtmosphere = min(hitInfo.y, dstToSurface - dstToAtmosphere);

        if (dstThroughAtmosphere > 0.0) {
            float epsilon = 0.0001; // This is for removing the noise artifacts caused by precision issues
            vec3 pointInAtmosphere = rayOrigin + rayDirection * (dstToAtmosphere + epsilon);
            vec3 light = calculateLight(pointInAtmosphere, rayDirection, dstThroughAtmosphere - epsilon * 2., originalCol.xyz);
            gl_FragColor = vec4(light, 0.0);
        }

    }


`; export default atmosFrag;